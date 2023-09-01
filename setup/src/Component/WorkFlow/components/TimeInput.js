import React, { useContext } from "react";
import { Input } from "antd";

import { CodeTypeListContext, CodeTypeDispatchContext } from "../CodeTypeList";

export default function TimeInput() {
  const contextSetState = useContext(CodeTypeDispatchContext);
  const contextState = useContext(CodeTypeListContext) || {};
  const { nodeData, timeRgx } = contextState;

  const hasError = !timeRgx.test(nodeData.runAtTime);

  const handleChange = ({ target: { value } }) => {
    contextSetState({ nodeData: { ...nodeData, runAtTime: value } });
  };

  return (
    <Input
      size="small"
      placeholder="hh:ss"
      style={{ ...(hasError ? { borderColor: "red" } : {}) }}
      value={nodeData.runAtTime}
      onChange={handleChange}
    />
  );
}
