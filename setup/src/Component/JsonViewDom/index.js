import { Switch } from "antd";
import React, { useState } from "react";
import ReactJson from "react-json-view-repair";

export default function Index() {
  const [jsonData] = useState({
    array: [1, 2, 3],
    bool: true,
    object: {
      foo: "bar",
    },
    name: "wpl",
  });
  const [currentTheme, setCurrentTheme] = useState(true);
  return (
    <>
      <Switch
        checked={currentTheme}
        onChange={(currentTheme) => setCurrentTheme(currentTheme)}
      />
      <ReactJson
        theme={currentTheme ? "rjv-default" : "ashes"}
        name={null}
        indentWidth={2}
        enableClipboard={false}
        displayDataTypes={false}
        src={jsonData}
        keyWord="wpl"
      />
    </>
  );
}
