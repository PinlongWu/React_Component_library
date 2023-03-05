export default class WorkerBuilder extends Worker {
  constructor(worker) {
    const code = worker.toString();
    const blob = new Blob([`(${code})()`]);
    // URL.createObjectURL(blob) 获取文件url
    return new Worker(URL.createObjectURL(blob));
  }
}
