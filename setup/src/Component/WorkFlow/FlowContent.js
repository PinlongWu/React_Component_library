import React, { useMemo, useReducer } from "react";
import { Button, Dropdown, Input, Menu } from "antd";
import {
  CaretRightOutlined,
  DeleteOutlined,
  MoreOutlined,
  SaveOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import FlowGraphics from "./components/FlowGraphics";
import EditInput from "./components/EditInput";

export default function FlowContent() {
  const [state, setState] = useReducer(
    (oldVal, newVal) => ({ ...oldVal, ...newVal }),
    {
      editTitle: false,
      workFlowInfo: { title: "Untitled workflow" },
    }
  );
  const { editTitle, workFlowInfo } = state;

  const menuList = useMemo(() => {
    return (
      <Menu>
        <Menu.Item key="setting" icon={<SettingOutlined />}>
          Setting
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="delete" icon={<DeleteOutlined />}>
          Delete workflow
        </Menu.Item>
      </Menu>
    );
  }, []);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgb(218, 220, 224)",
          marginBottom: 8,
          paddingBottom: 8,
        }}
      >
        <div
          style={{
            flex: 1,
            marginRight: 8,
            overflow: "hidden",
          }}
        >
          <EditInput
            workFlowInfo={workFlowInfo}
            textStyle={{ fontSize: 24 }}
            inputStyle={{ height: 38, fontSize: 24 }}
            handleChange={(value) =>
              setState({ workFlowInfo: { ...workFlowInfo, title: value } })
            }
          />
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <Button
            size="small"
            type="primary"
            icon={<SaveOutlined />}
            style={{ marginRight: 8 }}
          >
            Save
          </Button>
          <Button
            size="small"
            icon={<CaretRightOutlined />}
            style={{ marginRight: 8 }}
          >
            Run
          </Button>

          <Dropdown trigger="click" overlay={menuList}>
            <Button
              size="small"
              style={{ border: "none" }}
              icon={
                <MoreOutlined style={{ fontSize: 16, fontWeight: "bold" }} />
              }
            />
          </Dropdown>
        </div>
      </div>
      <FlowGraphics />
    </div>
  );
}
