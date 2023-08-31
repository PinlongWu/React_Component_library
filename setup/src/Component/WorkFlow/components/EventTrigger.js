import React, { useContext } from "react";
import { Select } from "antd";

import { CodeTypeListContext, CodeTypeDispatchContext } from "../CodeTypeList";
import ActiveTriggerHeader from "./ActiveTriggerHeader";
import CodeMirrorEditor from "./CodeMirrorEditor";

export default function EventTrigger() {
  const contextSetState = useContext(CodeTypeDispatchContext);
  const contextState = useContext(CodeTypeListContext) || {};
  const { nodeData } = contextState;

  return (
    <>
      <ActiveTriggerHeader />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          paddingTop: 8,
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: 12, marginBottom: 4 }}>Event type</span>
        <Select
          size="small"
          value={nodeData.type}
          onChange={(value) =>
            contextSetState({ nodeData: { ...nodeData, type: value } })
          }
          options={[
            { value: "Events", label: "Events" },
            { value: "Metric", label: "Metric" },
          ]}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", paddingTop: 8 }}>
        <span style={{ fontSize: 12, marginBottom: 4 }}>Filter query</span>
        <CodeMirrorEditor mode='sql'/>
      </div>
    </>
  );
}
