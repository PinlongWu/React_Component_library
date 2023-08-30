import React from 'react'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from '../Home'
import TimeTest from '../Component/TimeTest/TimeTest'
import ElementDrag from '../Component/ElementDrag/ElementDrag'
import EmTest from '../Component/EmTest'
import TreeSelectTest from '../Component/TreeSelectTest'
import BigFileUpload from '../Component/BigFileUpload'
import AntdBigFileUpload from '../Component/AntdBigFileUpload'
import AntdBigFileUploadArrange from '../Component/AntdBigFileUploadArrange'
import AntdBigFileUploadCSV from '../Component/AntdBigFileUploadCSV'
import JsonViewDom from '../Component/JsonViewDom'
import Websocket from '../Component/Websocket/Index'
import Masonry from '../Component/Masonry'
import Reactflow from '../Component/Reactflow'
import Clipboard from '../Component/Clipboard';
import WorkFlow from '../Component/WorkFlow';

export default function index() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/timeTest" element={<TimeTest/>} />
        <Route path="/elementDrag" element={<ElementDrag/>} />
        <Route path="/emTest" element={<EmTest/>} />
        <Route path="/treeSelectTest" element={<TreeSelectTest/>} />
        <Route path="/bigFileUpload" element={<BigFileUpload/>} />
        <Route path="/antdBigFileUpload" element={<AntdBigFileUpload/>} />
        <Route path="/antdBigFileUploadArrange" element={<AntdBigFileUploadArrange/>} />
        <Route path="/antdBigFileUploadCSV" element={<AntdBigFileUploadCSV/>} />
        <Route path="/jsonViewDom" element={<JsonViewDom/>} />
        <Route path="/websocket" element={<Websocket/>} />
        <Route path="/masonry" element={<Masonry/>} />
        <Route path="/reactflow" element={<Reactflow/>} />
        <Route path="/clipboard" element={<Clipboard/>} />
        <Route path="/workFlow" element={<WorkFlow/>} />
      </Routes>
    </Router>
  )
}
