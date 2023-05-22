const express = require("express");
const path = require("path");
const fse = require("fs-extra"); //文件处理模块
const multiparty = require("multiparty"); // 中间件，处理FormData对象的中间件
const bodyParser = require("body-parser");

let app = express();
let errFlag = 0;
const UPLOAD_FILES_DIR = path.resolve(__dirname, ".", "filelist"); // 读取根目录，创建一个文件夹qiepian存放切片
// 配置请求参数解析器
const jsonParser = bodyParser.json({ extended: false });
// 配置跨域
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});
// 获取已上传的文件列表
const getUploadedChunkList = async (fileHash) => {
  const isExist = fse.existsSync(path.resolve(UPLOAD_FILES_DIR, fileHash));
  if (isExist) {
    return await fse.readdir(path.resolve(UPLOAD_FILES_DIR, fileHash));
  }
  return [];
};

app.post("/verFileIsExist", jsonParser, async (req, res) => {
  errFlag = 0
  const { fileHash, suffix } = req.body;
  const filePath = path.resolve(UPLOAD_FILES_DIR, fileHash + "." + suffix);
  if (fse.existsSync(filePath)) {
    res.send({
      code: 200,
      shouldUpload: false,
    });
    return;
  }
  const list = await getUploadedChunkList(fileHash);
  if (list.length > 0) {
    res.send({
      code: 200,
      shouldUpload: true,
      uploadedChunkList: list,
    });
    return;
  }
  setTimeout(() => {
    res.send({
      code: 200,
      shouldUpload: true,
      uploadedChunkList: [],
    });
  }, Math.floor(Math.random() * (2000 - 1000)) + 1000);
});

app.post("/upload", async (req, res) => {
  errFlag += 1;
  const multipart = new multiparty.Form();
  multipart.parse(req, async (err, fields, files) => {
    if (err) return;
    const [chunk] = files.chunk;
    const [hash] = fields.hash;
    const [suffix] = fields.suffix;
    // 注意这里的hash包含文件的hash和块的索引，所以需要使用split切分
    const chunksDir = path.resolve(UPLOAD_FILES_DIR, hash.split("-")[0]);
    if (!fse.existsSync(chunksDir)) {
      await fse.mkdirs(chunksDir);
    }
    await fse.move(chunk.path, chunksDir + "/" + hash);
  });
  if (errFlag === 5) {
    res.status(500).send("received file chunk");
  } else {
    res.status(200).send("received file chunk");
  }
});

const pipeStream = (path, writeStream) =>
  new Promise((resolve) => {
    const readStream = fse.createReadStream(path);
    readStream.on("end", () => {
      fse.unlinkSync(path);
      resolve();
    });
    readStream.pipe(writeStream);
  });

// 合并切片
const mergeFileChunk = async (filePath, fileHash, size) => {
  const chunksDir = path.resolve(UPLOAD_FILES_DIR, fileHash);
  const chunkPaths = await fse.readdir(chunksDir);
  chunkPaths.sort((a, b) => a.split("-")[1] - b.split("-")[1]);
  console.log("指定位置创建可写流", filePath);
  await Promise.all(
    chunkPaths.map((chunkPath, index) =>
      pipeStream(
        path.resolve(chunksDir, chunkPath),
        // 指定位置创建可写流
        fse.createWriteStream(filePath, {
          start: index * size,
          end: (index + 1) * size,
        })
      )
    )
  );
  // 合并后删除保存切片的目录
  fse.rmdirSync(chunksDir);
};

app.post("/merge", jsonParser, async (req, res) => {
  const { fileHash, suffix, size } = req.body;
  const filePath = path.resolve(UPLOAD_FILES_DIR, fileHash + "." + suffix);
  await mergeFileChunk(filePath, fileHash, size);
  res.send({
    code: 200,
    message: "success",
  });
});

app.post("/test", jsonParser, async (req, res) => {
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  const timeout = randomInt(2, 10) * 100;
  setTimeout(() => {
    res.send({
      code: 200,
      message: "success",
      data: req.body.name,
    });
  }, timeout);
});

app.listen(3001, () => {
  console.log("listen:3001");
});
