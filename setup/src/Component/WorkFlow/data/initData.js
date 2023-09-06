import moment from "moment";

export const eventTriggerInitData = {
  type: "Events",
  codeContent: "",
};

export const fixedTimeTriggerInitData = {
  runAtTime: "00:00",
  ruleTimeType: "everyDay",
  timeZoneValue: "Asia/Shanghai",
  startTime: moment.utc().startOf("days").valueOf(),
  endType: "never",
  endTime: moment.utc().endOf("days").valueOf(),
  maxNum: 10,
};

export const timeIntervalTriggerInitData = {
  runEveryMins: 30,
  ruleTimeType: "everyDay",
  timeZoneValue: "Asia/Shanghai",
  notRunBefore: "00:00",
  notRunAfter: "23:59",
  runAtTime: "00:00",
  startTime: moment.utc().startOf("days").valueOf(),
  endType: "never",
  endTime: moment.utc().endOf("days").valueOf(),
  maxNum: 10,
};
