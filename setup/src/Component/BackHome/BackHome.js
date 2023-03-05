import React from "react";
import { Button } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export default function BackHome() {
  const navigate = useNavigate();
  return (
    <Button
      type="primary"
      shape="circle"
      icon={<LeftOutlined />}
      style={{ marginBottom: 20 }}
      onClick={() => navigate("/", { replace: true })}
    />
  );
}
