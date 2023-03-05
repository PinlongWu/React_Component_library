import React, { useReducer, useRef, useState } from "react";
import { Button, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";

import WorkerBuilder from "./worker-build";
import hashWorker from "./hash-worker";
import request from "./request";

import BackHome from "../BackHome/BackHome";
import ProgressBox from "./ProgressBox";

const CHUNK_SIZE = 2 * 1024 * 1024; // 2M

export default function Index() {
  const [state, setState] = useReducer(
    (oldVal, newVal) => ({ ...oldVal, ...newVal }),
    {
      chunkList: [],
      hashPercentage: 0, // 解析文件生成hash的进度
      fileName: "",
      updateFileProgress: 0,
      updateType: "padding",
      shouldUpload: false,
    }
  );
  const {
    chunkList,
    hashPercentage,
    fileName,
    updateFileProgress,
    updateType,
    shouldUpload
  } = state;
  const fileInput = useRef(null);
  const timeOut = useRef(null);

  const clearState = () => {
    setState({
      chunkList: [],
      hashPercentage: 0,
      fileName: "",
      updateFileProgress: 0,
      updateType: "padding",
      shouldUpload: false,
    });
  };

  // 获取文件后缀名
  const getFileSuffix = (fileName) => {
    let arr = fileName.split(".");
    if (arr.length > 0) {
      return arr[arr.length - 1];
    }
    return "";
  };

  // 切片文件
  const splitFile = (file, size = CHUNK_SIZE) => {
    const fileChunkList = [];
    for (let i = 0; i < file.size; i += size) {
      fileChunkList.push({ chunk: file.slice(i, i + size) });
    }
    return fileChunkList;
  };

  // 计算文件hash
  const calculateHash = (chunkList) => {
    return new Promise((resolve) => {
      const woker = new WorkerBuilder(hashWorker);
      woker.postMessage({ chunkList: chunkList });
      woker.onmessage = (e) => {
        const { percentage, hash } = e.data;
        setState({ hashPercentage: percentage });
        if (hash) {
          // 当hash计算完成时，执行resolve
          resolve(hash);
        }
      };
    });
  };

  // 秒传：验证文件是否存在服务器
  const verfileIsExist = async (fileHash, suffix) => {
    const { data } = await request({
      url: "http://localhost:3001/verFileIsExist",
      headers: {
        "content-type": "application/json",
      },
      data: JSON.stringify({
        fileHash: fileHash,
        suffix: suffix,
      }),
    });
    return JSON.parse(data);
  };

  // 发送合并请求
  const mergeRequest = (hash, fileName) => {
    request({
      url: "http://localhost:3001/merge",
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      data: JSON.stringify({
        // 服务器存储的文件名：hash+文件后缀名
        fileHash: hash,
        suffix: getFileSuffix(fileName),
        // 用于服务器合并文件
        size: CHUNK_SIZE,
      }),
    })
      .then((res) => {
        setState({ updateType: "success", updateFileProgress: 100 });
        timeOut.current = setTimeout(() => {
          clearState();
          timeOut.current = null;
        }, 3000);
      })
      .catch((e) => {
        setState({ updateType: "error" });
        timeOut.current = setTimeout(() => {
          clearState();
          timeOut.current = null;
        }, 3000);
      });
  };

  // 上传分片
  const uploadChunks = async (chunksData, hash, fileName) => {
    const formDataList = chunksData.map(({ chunk, hash }) => {
      const formData = new FormData();
      formData.append("chunk", chunk);
      formData.append("hash", hash);
      formData.append("suffix", getFileSuffix(fileName));
      return { formData };
    });
    const formDataListLength = formDataList.length;

    let currentTaskNum = 0;
    let max = 6;
    const dataList = [];
    let progress = 0;
    // 请求池
    const requestPool = () => {
      if (currentTaskNum < max && formDataList.length) {
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
                    mergeRequest(hash, fileName);
                  }, 1000);
                });
              } else {
                progress += 100 / formDataListLength;
                setState({ updateFileProgress: progress > 95 ? 95 : progress });
                currentTaskNum--;
                requestPool();
              }
            })
            .catch((e) => {
              console.log(e);
              setState({ updateType: "error" });
              timeOut.current = setTimeout(() => {
                clearState();
                timeOut.current = null;
              }, 3000);
            });
        }
        requestPool();
      }
    };
    requestPool();
  };

  // 选择文件
  const fileChange = async (event) => {
    if (timeOut) {
      timeOut.current = null;
      clearState();
    }

    const { files } = event.target;
    console.log(files,'files')
    if (files.length === 0) return;
    // 保存文件名, 文件分片
    const chunkList = splitFile(files[0]);
    // 计算文件hash
    const hash = await calculateHash(chunkList);
    setState({ chunkList, fileName: files[0].name });

    // 验证文件是否存在服务器
    const { shouldUpload, uploadedChunkList } = await verfileIsExist(
      hash,
      getFileSuffix(files[0].name)
    );
    if (!shouldUpload) {
      setState({ fileName: "", hashPercentage: 0, shouldUpload: true });
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

    const chunksData = chunkList
      .map(({ chunk }, index) => ({
        chunk: chunk,
        hash: hash + "-" + index,
        progress: 0,
      }))
      .filter((item2) => {
        // 过滤掉已上传的块
        const arr = item2.hash.split("-");
        return (
          uploadedChunkIndexList.indexOf(parseInt(arr[arr.length - 1])) === -1
        );
      });
    // 开始上传分片
    uploadChunks(chunksData, hash, files[0].name);
  };

  return (
    <>
      <BackHome></BackHome>
      <h3>选择文件后点击“上传文件”按钮即可</h3>
      <Spin
        tip="正在解析文件..."
        spinning={hashPercentage !== 0 && hashPercentage !== 100}
      >
        <div>
          <input
            type="file"
            id="inputFile"
            ref={fileInput}
            multiple={false}
            style={{ display: "none" }}
            onChange={fileChange}
          />
          <Button
            icon={<UploadOutlined />}
            onClick={() => {
              fileInput.current.value = ''
              fileInput.current.click()
            }}
          >
            Click to Upload
          </Button>
          <ProgressBox
            chunkList={chunkList}
            fileName={fileName}
            updateFileProgress={updateFileProgress}
            updateType={updateType}
            hashPercentage={hashPercentage}
            shouldUpload={shouldUpload}
          />
        </div>
      </Spin>
    </>
  );
}
