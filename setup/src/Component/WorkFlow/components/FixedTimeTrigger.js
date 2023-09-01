import React, { useContext } from "react";
import * as R from "ramda";
import moment from "moment";
import { Collapse, DatePicker, Divider, InputNumber, Select } from "antd";

import { CodeTypeListContext, CodeTypeDispatchContext } from "../CodeTypeList";

import ActiveTriggerHeader from "./ActiveTriggerHeader";
import TimeInput from "./TimeInput";
import TimeAlter from "./TimeAlter";

const timeNameOprion = R.map(
  (item) => ({ label: item, value: item }),
  moment.tz.names() || []
);

const ruleTimeTypeOption = [
  { value: "Every day", label: "Every day" },
  { value: "Every working day", label: "Every working day" },
  {
    value: "First working day of the month",
    label: "First working day of the month",
  },
  {
    value: "First working day of the week",
    label: "First working day of the week",
  },
  {
    value: "Last working day of the month",
    label: "Last working day of the month",
  },
  {
    value: "Last working day of the week",
    label: "Last working day of the week",
  },
];

const endType = [
  { value: "Never", label: "Never" },
  { value: "After a date", label: "After a date" },
  {
    value: "After number of runs",
    label: "After number of runs",
  },
];

export default function FixedTimeTrigger() {
  const contextSetState = useContext(CodeTypeDispatchContext);
  const contextState = useContext(CodeTypeListContext) || {};
  const { nodeData } = contextState;

  const startTimeObj = moment.utc(nodeData.startTime);
  const endTimeObj = moment.utc(nodeData.endTime);

  return (
    <>
      <ActiveTriggerHeader />
      <div style={{ flex: 1, overflowY: "scroll", paddingRight: 14 }}>
        <TimeAlter />
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              paddingTop: 8,
              marginBottom: 16,
              marginRight: 16,
              flex: 1,
            }}
          >
            <span style={{ fontSize: 12, marginBottom: 4 }}>Run at</span>
            <TimeInput />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              paddingTop: 8,
              marginBottom: 16,
              flex: 1,
            }}
          >
            <span style={{ fontSize: 12, marginBottom: 4 }}>Rule</span>
            <Select
              size="small"
              options={ruleTimeTypeOption}
              value={nodeData.ruleTimeType}
              onChange={(value) =>
                contextSetState({
                  nodeData: { ...nodeData, ruleTimeType: value },
                })
              }
            />
          </div>
        </div>
        <Divider style={{ margin: "20px 0" }} />
        <Collapse
          bordered={false}
          defaultActiveKey={["advancedOptions"]}
          style={{ background: "transparent" }}
        >
          <Collapse.Panel
            header="Advanced options"
            key="advancedOptions"
            style={{ marginBottom: 24, border: 0, userSelect: "none", }}
          >
            <div style={{ paddingLeft: 24 }}>
              <div style={{ color: "#848282" }}>
                Set a time zone, start date, and end date.
              </div>
              <Divider style={{ margin: "24px 0 12px 0px" }} />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginBottom: 16,
                  marginRight: 16,
                  flex: 1,
                }}
              >
                <span style={{ fontSize: 12, marginBottom: 4 }}>Timezone</span>
                <Select
                  showSearch
                  size="small"
                  value={nodeData.timeZoneValue}
                  options={timeNameOprion}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  onChange={(timeZoneValue) =>
                    contextSetState({
                      nodeData: { ...nodeData, timeZoneValue },
                    })
                  }
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginBottom: 16,
                  marginRight: 16,
                  flex: 1,
                }}
              >
                <span style={{ fontSize: 12, marginBottom: 4 }}>
                  Start date
                </span>
                <DatePicker
                  size="small"
                  allowClear={false}
                  showToday={false}
                  value={startTimeObj}
                  disabledDate={(current) => {
                    return current && current < moment.utc().startOf("day");
                  }}
                  onChange={(timeObj) => {
                    const startTimeTamp = moment
                      .utc(timeObj.valueOf())
                      .valueOf();
                    contextSetState({
                      nodeData: { ...nodeData, startTime: startTimeTamp },
                    });
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginBottom: 16,
                  marginRight: 16,
                  flex: 1,
                }}
              >
                <span style={{ fontSize: 12, marginBottom: 4 }}>End</span>
                <Select
                  size="small"
                  options={endType}
                  value={nodeData.endType}
                  onChange={(value) =>
                    contextSetState({
                      nodeData: {
                        ...nodeData,
                        endType: value,
                        endTimeObj: moment.utc().endOf("days").valueOf(),
                        maxNum: 10,
                      },
                    })
                  }
                />
              </div>
              {nodeData.endType === "After a date" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginBottom: 16,
                    marginRight: 16,
                    flex: 1,
                  }}
                >
                  <span style={{ fontSize: 12, marginBottom: 4 }}>Until</span>
                  <DatePicker
                    size="small"
                    allowClear={false}
                    showToday={false}
                    value={endTimeObj}
                    disabledDate={(current) => {
                      return current && current < moment.utc().startOf("day");
                    }}
                    onChange={(timeObj) => {
                      const endTimeTamp = moment
                        .utc(timeObj.valueOf())
                        .valueOf();
                      contextSetState({
                        nodeData: { ...nodeData, endTime: endTimeTamp },
                      });
                    }}
                  />
                </div>
              )}
              {nodeData.endType === "After number of runs" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginBottom: 16,
                    marginRight: 16,
                    flex: 1,
                  }}
                >
                  <span style={{ fontSize: 12, marginBottom: 4 }}>Max</span>
                  <InputNumber
                    min={0}
                    size="small"
                    value={nodeData.maxNum}
                    style={{ width: "100%" }}
                    onChange={(value) =>
                      contextSetState({
                        nodeData: { ...nodeData, maxNum: value },
                      })
                    }
                  />
                </div>
              )}
            </div>
          </Collapse.Panel>
        </Collapse>
      </div>
    </>
  );
}
