import React from "react";
import { Progress } from "antd";

export default function ProgressBox({
  chunkList,
  fileName,
  updateFileProgress,
  updateType,
  hashPercentage,
  shouldUpload,
}) {
  return (
    <>
      {shouldUpload && <div>文件已存在，无需重复上传</div>}
      {!shouldUpload && fileName && hashPercentage === 100 && (
        <>
          <div>文件名: {fileName}</div>
          <div style={{ display: "flex" }}>
            总进度:
            <Progress
              style={{ flex: 1, marginLeft: 10 }}
              percent={updateFileProgress}
              status={updateType === "error" ? "exception" : "success"}
            />
          </div>
        </>
      )}
    </>
  );
}
