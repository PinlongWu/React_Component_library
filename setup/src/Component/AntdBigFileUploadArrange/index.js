import React, { Component } from "react";
import * as R from "ramda";
import update from "immutability-helper";
import { message, Progress, Upload } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  LoadingOutlined,
  SyncOutlined,
  UploadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import WorkerBuilder from "./worker-build";
import hashWorker from "./hash-worker";
import request from "./request";

import BackHome from "../BackHome/BackHome";

const stateMap = {
  wait: <ClockCircleOutlined />,
  analysis: <LoadingOutlined />,
  progress: <LoadingOutlined />,
  success: <CheckCircleOutlined />,
  error: <ExclamationCircleOutlined />,
};
const stateTextMap = {
  wait: "In queue...", //等待
  analysis: "File parsing...", // 文件解析中
  progress: "Uploading...", // 进行中
  success: "Success", // 成功
  error: "Fail", // 失败
};
const textColor = {
  wait: "#d48806", //等待
  analysis: "#1677ff", // 文件解析中
  progress: "#1677ff", // 进行中
  success: "#52c41a", // 成功
  error: "#cf1322", // 失败
};
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
    };

    this.removeFileFlag = false;
    this.waitIndex = -1;
    this.maxFileLen = 0; // 上传的length
    this.CHUNK_NUM_SIZE = 2;
    this.CHUNK_SIZE = this.CHUNK_NUM_SIZE * 1024 * 1024; // 2M
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
        if (this.removeFileFlag) {
          this.removeFileFlag = false;
          woker.terminate();
          this.handleUploadAvatar();
        }
        const { hash } = e.data;
        if (hash) {
          // 当hash计算完成时，执行resolve
          resolve(hash);
        }
      };
    });
  };

  // 修改文件状态
  updataFileState = (fileList, restObj, waitIndex) => {
    waitIndex = R.isNil(waitIndex) ? this.waitIndex : waitIndex;
    fileList = update(fileList, {
      [waitIndex]: {
        $set: {
          ...fileList[waitIndex],
          ...restObj,
        },
      },
    });
    return fileList;
  };

  // 重置状态
  resetFileState = (uid) => {
    let { fileList } = this.state;
    const findIndex = R.findIndex((item) => item.uid === uid, fileList || []);
    fileList = this.updataFileState(fileList, { state: "wait" }, findIndex);
    this.setState({ fileList }, () => {
      this.handleUploadAvatar();
    });
  };

  // 删除file
  removeRile = (uid) => {
    let { fileList } = this.state;
    const removeFileIdx = R.findIndex((item) => item.uid === uid, fileList);
    const processFileIdx = R.findIndex(
      (item) => item.state === "analysis" || item.state === "progress",
      fileList
    );

    // 只有等待、成功、失败 和 删除的idx比正在上传的idx大就直接删除
    fileList = R.filter((item) => item.uid !== uid, fileList);
    if (removeFileIdx === processFileIdx) {
      // 删除当前正在上传的文件
      this.removeFileFlag = true;
    } else if (removeFileIdx < processFileIdx) {
      // 删除的idx比正在上传的idx小
      this.waitIndex -= 1;
    }
    this.maxFileLen = fileList.length;
    if (fileList.length === 0) this.waitIndex = -1;

    this.setState({ fileList });
  };

  // 过滤切片
  filterChunk = (uploadedChunkList, chunkList, hash, file) => {
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
        let { fileList } = this.state;
        fileList = this.updataFileState(fileList, {
          state: "success",
          percentage: 0,
          uploadedSize: fileList[this.waitIndex]?.fileTotalSize,
        });
        this.setState({ fileList }, () => {
          this.handleUploadAvatar();
        });
      })
      .catch((e) => {
        let { fileList } = this.state;
        fileList = this.updataFileState(fileList, {
          state: "error",
          percentage: 0,
          uploadedSize: 0,
        });
        console.error(e);
        this.setState({ fileList }, () => {
          this.handleUploadAvatar();
        });
      });
  };

  // 上传分片
  uploadChunks = (chunksData, hash, fileName) => {
    // 创建数据流列表
    const formDataList = chunksData.map(({ chunk, hash }) => {
      const formData = new FormData();
      formData.append("chunk", chunk);
      formData.append("hash", hash);
      formData.append("suffix", this.getFileSuffix(fileName));
      return { formData };
    });
    const formDataListLength = formDataList.length;

    let { fileList } = this.state;
    fileList = this.updataFileState(fileList, { state: "progress" });

    this.setState({ fileList }, () => {
      const dataList = []; // 请求返回的所有数据
      let currentTaskNum = 0; //请求位
      let progress = 0; // 进度
      let hasError = false; // 是否有错误

      // 请求池
      const requestPool = () => {
        if (this.removeFileFlag) {
          hasError = true;
          progress = 0;
          this.removeFileFlag = false;
          this.handleUploadAvatar();
          return;
        }

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
                  let { fileList } = this.state;
                  fileList = this.updataFileState(fileList, {
                    percentage: progress,
                    uploadedSize:
                      fileList[this.waitIndex]?.uploadedSize +
                      this.CHUNK_NUM_SIZE,
                  });
                  this.setState({ fileList }, () => {
                    currentTaskNum--;
                    requestPool();
                  });
                }
              })
              .catch((e) => {
                console.error(e);
                hasError = true;
                let { fileList } = this.state;
                fileList = this.updataFileState(fileList, {
                  state: "error",
                  percentage: 0,
                  uploadedSize: 0,
                });
                this.setState({ fileList }, () => {
                  this.handleUploadAvatar();
                });
              });
          }
          requestPool();
        }
      };
      requestPool();
    });
  };

  handleUpdate = async (fileInfo) => {
    const { fileData: file } = fileInfo;
    if (!file) return;

    // 保存文件名, 文件分片
    const chunkList = this.splitFile(file);
    // 计算文件hash
    const hash = await this.calculateHash(chunkList);

    // 验证文件是否存在服务器
    const { shouldUpload, uploadedChunkList } = await this.verfileIsExist(
      hash,
      this.getFileSuffix(file.name)
    );

    if (this.removeFileFlag) {
      this.removeFileFlag = false;
      this.handleUploadAvatar();
      return;
    }

    if (!shouldUpload) {
      let { fileList } = this.state;
      fileList = this.updataFileState(fileList, {
        state: "error",
        percentage: 0,
        uploadedSize: 0,
      });
      this.setState({ fileList }, () => {
        this.handleUploadAvatar();
      });
      message.error(`${file.name} 文件已存在，无需重复上传`);
      return;
    }

    const uploadFileSize = uploadedChunkList.length * this.CHUNK_NUM_SIZE;
    // 文件大小减去以上传的文件大小
    if (uploadFileSize > 0) {
      let { fileList } = this.state;
      let fileTotalSize = fileList[this.waitIndex]?.fileTotalSize;
      fileTotalSize =
        uploadFileSize >= fileTotalSize
          ? fileTotalSize
          : fileTotalSize - uploadFileSize;
      fileList = this.updataFileState(fileList, {
        fileTotalSize: fileTotalSize,
      });
      this.setState({ fileList }, () => {
        this.filterChunk(uploadedChunkList, chunkList, hash, file);
      });
    } else {
      this.filterChunk(uploadedChunkList, chunkList, hash, file);
    }
  };

  handleUploadAvatar = async (option) => {
    this.removeFileFlag = false;
    let { fileList } = this.state;
    fileList = R.filter((item) => item.fileData, fileList);
    this.setState({ fileList }, () => {
      let { fileList } = this.state;
      if (option) this.maxFileLen += 1;
      if (this.maxFileLen === fileList.length) {
        // 有没有进行中或者解析中
        const progressItem = R.find(
          (item) => item.state === "progress" || item.state === "analysis",
          fileList || []
        );
        if (progressItem) return;
        // 有没有等待的
        const waitIndex = R.findIndex(
          (item) => item.state === "wait",
          fileList || []
        );
        if (waitIndex === -1) return;

        this.waitIndex = waitIndex;
        fileList = this.updataFileState(fileList, {
          state: "analysis",
        });
        this.setState({ fileList }, () => {
          this.handleUpdate(fileList[this.waitIndex]);
        });
      }
    });
  };

  render() {
    const { fileList } = this.state;
    return (
      <>
        <BackHome />
        <div style={{ width: 400, height: 200 }}>
          <Upload.Dragger
            fileList={fileList}
            multiple
            showUploadList={false}
            beforeUpload={(file, filelLists) => {
              const newFileList = R.map((item) => {
                const fileTotalSize = item.size / 1024 / 1024;
                return {
                  fileData: item,
                  state: "wait",
                  percentage: 0,
                  fileTotalSize,
                  uploadedSize: 0,
                  name: item.name,
                };
              }, filelLists);

              this.setState({ fileList: [...fileList, ...newFileList] });
            }}
            customRequest={this.handleUploadAvatar}
          >
            <div
              className="ant-upload-drag-icon"
              style={{
                fontSize: 30,
                lineHeight: "30px",
                marginBottom: 10,
                color: "var(--text-color)",
              }}
            >
              <UploadOutlined />
            </div>
            <div className="ant-upload-text" style={{ fontSize: 14 }}>
              Click or drag file to this area to upload
            </div>
          </Upload.Dragger>
        </div>
        {fileList.length > 0 && (
          <div
            style={{
              width: 500,
              maxHeight: 300,
              border: "1px solid #ccc",
              overflowY: "auto",
              background: "#f9f9f9",
              cursor: "pointer",
            }}
          >
            {R.addIndex(R.map)((item, index) => {
              const { state, percentage, name, uid } = item;
              let { fileTotalSize, uploadedSize } = item;
              fileTotalSize = Number(
                Number.parseFloat(fileTotalSize).toFixed(2)
              );
              uploadedSize = Number(Number.parseFloat(uploadedSize).toFixed(2));
              return (
                <div key={uid || index}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "10px",
                      color: textColor[state],
                    }}
                  >
                    <div
                      style={{
                        fontSize: 30,
                        marginRight: 10,
                      }}
                    >
                      {stateMap[state]}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        fontSize: 15,
                        marginRight: 10,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: "bold",
                          wordBreak: "keep-all",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {name}
                      </div>
                      <div style={{ fontSize: 13 }}>
                        <span style={{ marginRight: 20 }}>
                          {stateTextMap[state]}
                        </span>
                        <span>{`Downloaded: ${uploadedSize}MB / Total size: ${fileTotalSize}MB`}</span>
                      </div>
                    </div>
                    {state === "error" && (
                      <div
                        style={{ marginRight: 10 }}
                        onClick={() => this.resetFileState(uid)}
                      >
                        <SyncOutlined />
                      </div>
                    )}
                    <div
                      style={{ cursor: "pointer" }}
                      onClick={() => this.removeRile(uid)}
                    >
                      <DeleteOutlined />
                    </div>
                  </div>
                  {state === "progress" ? (
                    <Progress
                      strokeLinecap="butt"
                      percent={percentage}
                      showInfo={false}
                      style={{
                        display: "block",
                        lineHeight: 1,
                        height: 12,
                        marginBottom: 0,
                      }}
                    />
                  ) : (
                    <div style={{ borderBottom: "1px solid #ccc" }} />
                  )}
                </div>
              );
            }, fileList)}
          </div>
        )}
      </>
    );
  }
}
