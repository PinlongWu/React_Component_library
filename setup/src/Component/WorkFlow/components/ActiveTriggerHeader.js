import React, { useContext, useReducer } from "react";
import { RollbackOutlined } from "@ant-design/icons";

import { CodeTypeListContext, CodeTypeDispatchContext } from "../CodeTypeList";
import { Modal } from "antd";

export default function ActiveTriggerHeader() {
  const [state, setState] = useReducer(
    (oldVal, newVal) => ({ ...oldVal, ...newVal }),
    { showChangeTriggerModal: false }
  );
  const { showChangeTriggerModal } = state;
  const contextState = useContext(CodeTypeListContext) || {};
  const { activeTypeItem } = contextState;
  const contextSetState = useContext(CodeTypeDispatchContext) || {};

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: "bold",
              flex: 1,
              marginRight: 8,
              wordBreak: "keep-all",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {activeTypeItem.title}
          </div>
          <div
            onClick={() => setState({ showChangeTriggerModal: true })}
            style={{
              fontSize: 14,
              fontWeight: "bold",
              cursor: "pointer",
              padding: "4px 8px",
              flexShrink: 0,
            }}
          >
            <RollbackOutlined />
            <span style={{ marginLeft: 8 }}>Change trigger</span>
          </div>
        </div>
        <div style={{ fontSize: 14, wordBreak: "break-word" }}>
          {activeTypeItem.desc}
        </div>
      </div>
      {showChangeTriggerModal && (
        <Modal
          visible
          title="Are you sure you want to change the trigger type?"
          okText="Change trigger"
          onOk={() => {
            setState({ showChangeTriggerModal: false });
            contextSetState({ activeTypeItem: null });
          }}
          onCancel={() => setState({ showChangeTriggerModal: false })}
        >
          <div style={{ margin: "10px 0 20px 0" }}>
            Your current trigger configuration will be lost.
          </div>
        </Modal>
      )}
    </>
  );
}
