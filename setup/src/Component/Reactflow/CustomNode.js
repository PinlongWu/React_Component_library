import { Popover } from "antd";
import React, { memo } from "react";
import { Handle, Position } from "reactflow";

export default memo(({ data }) => {
  return (
    <Popover content={<div>111</div>}>
      <div
        style={{
          minWidth: 150,
          minHeight: 38,
          border: "1px solid",
          padding: 5,
          borderRadius: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          boxSizing: "border-box",
        }}
      >
        {data.label}
        <Handle
          type="source"
          position={Position.Top}
          id="a"
          style={{ visibility: "hidden" }}
        />
        <Handle
          type="source"
          position={Position.Top}
          id="e"
          style={{ visibility: "hidden", left: 10 }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="b"
          style={{ visibility: "hidden" }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="c"
          style={{ visibility: "hidden" }}
        />
        <Handle
          type="source"
          position={Position.Left}
          id="d"
          style={{ visibility: "hidden" }}
        />
      </div>
    </Popover>
  );
});
