import React from "react";
import copy from "copy-to-clipboard";
import { Button, Popover } from "antd";
import { SnippetsOutlined } from "@ant-design/icons";

export default function Index() {
  return (
    <Popover content="coyt">
      <Button
        class="btn"
        type="text"
        icon={<SnippetsOutlined />}
        onClick={() => copy("111")}
      />
    </Popover>
  );
}
