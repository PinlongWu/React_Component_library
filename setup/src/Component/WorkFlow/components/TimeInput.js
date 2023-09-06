import React, { useContext } from "react";
import { Input, InputNumber } from "antd";
import moment from "moment";

import { CodeTypeListContext, CodeTypeDispatchContext } from "../CodeTypeList";

const toTimeStr = (timeTamp) => moment.utc(timeTamp).format("HH:mm");
const toTimeTamp = (timeStr) => moment.duration(timeStr).asMilliseconds();
const toTimeMins = (timeTamp) => moment.duration(timeTamp).minutes();
const minsToTimeTamp = (mins) =>
  moment.duration(mins, "minutes").asMilliseconds();

export default function TimeInput({ type, dataKey, error }) {
  const contextSetState = useContext(CodeTypeDispatchContext);
  const contextState = useContext(CodeTypeListContext) || {};
  const { nodeData, timeRgx } = contextState;

  return (
    <>
      {type === "mins" && (
        <InputNumber
          min={1}
          max={720}
          size="small"
          precision={0}
          controls={false}
          style={{ width: "100%" }}
          value={nodeData[dataKey]}
          onChange={(value) =>
            contextSetState({ nodeData: { ...nodeData, [dataKey]: value || 1 } })
          }
        />
      )}
      {!["mins"].includes(type) && (
        <Input
          size="small"
          placeholder="hh:ss"
          style={{ ...(!timeRgx.test(nodeData[dataKey]) || error ? { borderColor: "red" } : {}) }}
          value={nodeData[dataKey]}
          onChange={({ target: { value } }) =>
            contextSetState({ nodeData: { ...nodeData, [dataKey]: value } })
          }
        />
      )}
    </>
  );
}
