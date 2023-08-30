import React, { useEffect, useRef } from "react";

import CodeTypeList from "./CodeTypeList";
import FlowContent from "./FlowContent";

let startX;
let startWidth;

export default function WorkFlow() {
  const workFlowBoxRef = useRef(null);
  const separatorRef = useRef(null);

  const startDrag = (e) => {
    startX = e.clientX;
    const width = window.getComputedStyle(workFlowBoxRef.current).width;
    startWidth = parseInt(width);
    const addEventListener = document.documentElement.addEventListener;
    addEventListener("mousemove", onDrag);
    addEventListener("mouseup", stopGrag);
  };

  const onDrag = (e) => {
    const newWidth = e.clientX - startX + startWidth;
    workFlowBoxRef.current.style.width = newWidth + "px";
  };

  const stopGrag = () => {
    const removeEventListener = document.documentElement.removeEventListener;
    removeEventListener("mousemove", onDrag);
    removeEventListener("mouseup", stopGrag);
  };

  useEffect(() => {
    const separatorRefDom = separatorRef.current;
    const removeEventListener = document.documentElement.removeEventListener;
    separatorRefDom.addEventListener("mousedown", startDrag);
    return () => {
      removeEventListener("mousemove", (e) => onDrag(e));
      removeEventListener("mouseup", stopGrag);
      separatorRefDom.removeEventListener("mousedown", startDrag);
    };
  }, []);

  return (
    <div style={{ display: "flex", height: "100%", padding: 10 }}>
      <div
        ref={workFlowBoxRef}
        style={{
          borderRadius: 10,
          border: "1px solid rgb(218, 220, 224)",
          padding: 16,
          width: 900,
          minWidth: 400,
          maxWidth: 1100,
        }}
      >
        <FlowContent />
      </div>

      <div
        ref={separatorRef}
        style={{
          width: 8,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "col-resize",
        }}
      >
        <div style={{ width: 2, height: 36, background: "#a5a6c4" }}></div>
      </div>

      <div
        style={{
          flex: 1,
          borderRadius: 10,
          border: "1px solid rgb(218, 220, 224)",
          padding: 16,
        }}
      >
        <CodeTypeList />
      </div>
    </div>
  );
}
