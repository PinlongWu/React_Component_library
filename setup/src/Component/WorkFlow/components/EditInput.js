import React, { useState } from "react";

import { Input } from "antd";

export default function EditInput({
  workFlowInfo = {},
  inputStyle = {},
  textStyle = {},
  handleChange,
}) {
  const [editFlag, setEditFlag] = useState(false);
  return (
    <>
      {editFlag ? (
        <Input
          autoFocus
          size="small"
          value={workFlowInfo.title}
          onBlur={() => setEditFlag(false)}
          onPressEnter={() => setEditFlag(false)}
          onChange={({ target: { value } }) => handleChange(value)}
          style={{
            display: "flex",
            alignItems: "center",
            fontWeight: "bold",
            ...inputStyle,
          }}
        />
      ) : (
        <div
          style={{
            cursor: "pointer",
            fontWeight: "bold",
            wordBreak: "keep-all",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            ...textStyle,
          }}
          onClick={() => setEditFlag(true)}
        >
          {workFlowInfo.title}
        </div>
      )}
    </>
  );
}
