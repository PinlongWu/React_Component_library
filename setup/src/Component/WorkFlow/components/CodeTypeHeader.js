import React from "react";

export default function CodeTypeHeader({ title, desc }) {
  return (
    <div style={{ marginBottom: 20, userSelect: "none" }}>
      <div
        style={{
          fontSize: 24,
          fontWeight: "bold",
          wordBreak: "keep-all",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 14, color: "#696868", marginTop: 8 }}>{desc}</div>
    </div>
  );
}
