import React, { Component } from "react";
import { Button, Spin, Upload } from "antd";
import { LoadingOutlined, UploadOutlined } from "@ant-design/icons";

import WorkerBuilder from "./worker-build";
import hashWorker from "./hash-worker";
import request from "./request";

import BackHome from "../BackHome/BackHome";

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      percentage: 0,
      chunkList: [],
      fileName: "",
      fileList: [],
    };

    this.CHUNK_SIZE = 2 * 1024 * 1024; // 2M
    this.MAX_REQUEST_NUM = 6;
  }

  // 获取文件后缀名
  getFileSuffix = (fileName) => {
    let arr = fileName.split(".");
    if (arr.length > 0) {
      return arr[arr.length - 1];
    }
    return "";
  };

  // 切片文件
  splitFile = (file, size = this.CHUNK_SIZE) => {
    const fileChunkList = [];
    for (let i = 0; i < file.size; i += size) {
      fileChunkList.push({ chunk: file.slice(i, i + size) });
    }
    return fileChunkList;
  };

  // 计算文件hash
  calculateHash = (chunkList) => {
    return new Promise((resolve) => {
      const woker = new WorkerBuilder(hashWorker);
      woker.postMessage({ chunkList: chunkList });
      woker.onmessage = (e) => {
        const { percentage, hash } = e.data;
        this.setState({ percentage });
        if (hash) {
          // 当hash计算完成时，执行resolve
          resolve(hash);
        }
      };
    });
  };

  // 秒传：验证文件是否存在服务器
  verfileIsExist = async (fileHash, suffix) => {
    const { data } = await request({
      url: "http://localhost:3001/verFileIsExist",
      headers: { "content-type": "application/json" },
      data: JSON.stringify({ fileHash: fileHash, suffix: suffix }),
    });
    return JSON.parse(data);
  };

  // 发送合并请求
  mergeRequest = (hash, fileName) => {
    request({
      url: "http://localhost:3001/merge",
      method: "post",
      headers: { "content-type": "application/json" },
      data: JSON.stringify({
        fileHash: hash, // 服务器存储的文件名：hash+文件后缀名
        suffix: this.getFileSuffix(fileName),
        size: this.CHUNK_SIZE, // 用于服务器合并文件
      }),
    })
      .then((res) => {
        this.setState({ fileList: this.setFileStatus("success", 100) });
      })
      .catch((e) => {
        this.setState({ fileList: this.setFileStatus("error") });
        console.error(e);
      });
  };

  // 上传分片
  uploadChunks = async (chunksData, hash, fileName) => {
    // 创建数据流列表
    const formDataList = chunksData.map(({ chunk, hash }) => {
      const formData = new FormData();
      formData.append("chunk", chunk);
      formData.append("hash", hash);
      formData.append("suffix", this.getFileSuffix(fileName));
      return { formData };
    });
    const formDataListLength = formDataList.length;

    const dataList = []; // 请求返回的所有数据
    let currentTaskNum = 0; //请求位
    let progress = 0; // 进度
    let hasError = false; // 是否有错误
    // 请求池
    const requestPool = () => {
      if (
        currentTaskNum < this.MAX_REQUEST_NUM &&
        formDataList.length &&
        !hasError
      ) {
        const curTask = request({
          url: "http://localhost:3001/upload",
          data: formDataList.shift().formData,
        });
        if (curTask && curTask.then) {
          currentTaskNum++;
          curTask
            .then((v) => {
              dataList.push(Promise.resolve(v));
              if (formDataListLength === dataList.length) {
                Promise.all(dataList).then(() => {
                  // 延迟发送合并请求，方便观察服务器合并文件的步骤
                  setTimeout(() => {
                    this.mergeRequest(hash, fileName);
                  }, 1000);
                });
              } else {
                progress += 100 / formDataListLength;
                this.setState(
                  { fileList: this.setFileStatus("uploading", progress) },
                  () => {
                    currentTaskNum--;
                    requestPool();
                  }
                );
              }
            })
            .catch((e) => {
              this.setState({ fileList: this.setFileStatus("error") });
              console.error(e);
              hasError = true;
            });
        }
        requestPool();
      }
    };
    requestPool();
  };

  handleUploadAvatar = async (option) => {
    const { file } = option;
    if (!file) return;

    // 保存文件名, 文件分片
    const chunkList = this.splitFile(file);
    // 计算文件hash
    const hash = await this.calculateHash(chunkList);
    this.setState({ chunkList, fileName: file.name });

    // 验证文件是否存在服务器
    const { shouldUpload, uploadedChunkList } = await this.verfileIsExist(
      hash,
      this.getFileSuffix(file.name)
    );

    if (!shouldUpload) {
      this.setState({ fileList: this.setFileStatus("error") });
      alert("文件已存在，无需重复上传");
      return;
    }

    // 已上传的切片
    let uploadedChunkIndexList = [];
    if (uploadedChunkList && uploadedChunkList.length > 0) {
      uploadedChunkIndexList = uploadedChunkList.map((item) => {
        const arr = item.split("-");
        return parseInt(arr[arr.length - 1]);
      });
    }

    // 过滤掉已上传的块
    const chunksData = chunkList
      .map(({ chunk }, index) => ({
        chunk: chunk,
        hash: hash + "-" + index,
        progress: 0,
      }))
      .filter((item2) => {
        const arr = item2.hash.split("-");
        return (
          uploadedChunkIndexList.indexOf(parseInt(arr[arr.length - 1])) === -1
        );
      });

    // 开始上传分片
    this.uploadChunks(chunksData, hash, file.name);
  };

  // 修改文件状态
  setFileStatus = (type, percent) => {
    let { fileList } = this.state;
    fileList[0].status = type;
    if (percent || percent === 0) {
      fileList[0].percent = percent;
    }
    return fileList;
  };

  render() {
    const { percentage, fileList } = this.state;
    return (
      <>
        <BackHome />
        <div>
          <Upload
            fileList={fileList}
            onRemove={() => this.setState({ fileList: [] })}
            beforeUpload={(file) => {
              this.setState({ fileList: [] }, () => {
                this.setState({ fileList: [file] });
              });
            }}
            customRequest={this.handleUploadAvatar}
            itemRender={(originNode, file) => (
              <>
                {percentage !== 0 && percentage !== 100 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: 10,
                    }}
                  >
                    <Spin
                      indicator={
                        <LoadingOutlined style={{ fontSize: 24 }} spin />
                      }
                    />
                    <div style={{ marginLeft: 16 }}>正在解析文件...</div>
                  </div>
                )}
                {percentage === 100 && <div>{originNode}</div>}
              </>
            )}
          >
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
        </div>
      </>
    );
  }
}
