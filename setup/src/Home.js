import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";

export default function Home() {
  const navigate = useNavigate()
  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      <Button type="primary" onClick={()=>navigate('/timeTest')}>Time Test 时间/时区</Button>
      <Button type="primary" onClick={()=>navigate('/elementDrag')}>元素拖拽</Button>
      <Button type="primary" onClick={()=>navigate('/emTest')}>Em适配测试</Button>
      <Button type="primary" onClick={()=>navigate('/treeSelectTest')}>treeSelectTest树选择</Button>
      <Button type="primary" onClick={()=>navigate('/bigFileUpload')}>大文件切片上传</Button>
      <Button type="primary" onClick={()=>navigate('/antdBigFileUpload')}>Antd大文件切片上传</Button>
      <Button type="primary" onClick={()=>navigate('/antdBigFileUploadArrange')}>Antd大文件切片排列上传</Button>
      <Button type="primary" onClick={()=>navigate('/antdBigFileUploadCSV')}>Antd-CSV大文件切片排列上传</Button>
      <Button type="primary" onClick={()=>navigate('/jsonViewDom')}>Json-View-Dom</Button>
      <Button type="primary" onClick={()=>navigate('/websocket')}>Websocket</Button>
      <Button type="primary" onClick={()=>navigate('/masonry')}>Masonry 瀑布流</Button>
      <Button type="primary" onClick={()=>navigate('/reactflow')}>Reactflow 关系图</Button>
      <Button type="primary" onClick={()=>navigate('/clipboard')}>复制</Button>
      <Button type="primary" onClick={()=>navigate('/workFlow')}>workFlow 流程图</Button>
    </div>
  );
}
