/* eslint-disable no-restricted-globals */
const hashWorker = () => {
  self.importScripts("https://cdn.bootcdn.net/ajax/libs/spark-md5/3.0.2/spark-md5.min.js");
  self.onmessage = (e) => {
    const { chunkList } = e.data; //切片数据
    const spark = new self.SparkMD5.ArrayBuffer();
    let percentage = 0;
    let count = 0;
    const loadNext = (index) => {
      const reader = new FileReader(); // 提供一个完整的事件模型，用来捕获读取文件的状态
      reader.readAsArrayBuffer(chunkList[index].chunk); // 异步按字节读取文件内容，结果用ArrayBuffer对象表示
      // 当读取操作成功完成时调用
      reader.onload = (event) => {
        count++;
        spark.append(event.target.result);
        if (count === chunkList.length) {
          self.postMessage({ percentage: 100, hash: spark.end() });
          self.close();
        } else {
          percentage += 100 / chunkList.length;
          self.postMessage({ percentage });
          loadNext(count);
        }
      };
    };
    loadNext(count);
  };
};

export default hashWorker;
