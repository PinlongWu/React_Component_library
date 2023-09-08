import React, { useContext, useEffect, useReducer } from "react";
import * as R from "ramda";
import moment from "moment";
import { isNumber } from "lodash";
import { Alert, Spin } from "antd";

import { CodeTypeListContext } from "../CodeTypeList";
import {
  DownOutlined,
  InfoCircleOutlined,
  UpOutlined,
} from "@ant-design/icons";

const returnTimeStr = (time, noUTC, format = "YYYY/MM/DD") => {
  if (noUTC) {
    return time.format(format);
  }
  return moment.utc(time).format(format);
};

const isNotWeekDay = (time) => time.day() === 0 || time.day() === 6; // // 如果当前日期是周末（0表示星期日，6表示星期六）

const strToTimeTamp = (timeStr) => moment.duration(timeStr).asMilliseconds();

const toTimeTamp = (time, type = "minutes") =>
  moment.duration(time, type).asMilliseconds();

const addTimeTamp = ({ activeType, runEveryMins, tamp = 0 }) => {
  if (activeType === "timeIntervalTrigger") {
    return toTimeTamp(runEveryMins);
  }
  return tamp;
};

const retrunTimeFormat = ({ time, activeType, runEveryMins }) => {
  return returnTimeStr(
    time + addTimeTamp(activeType, runEveryMins),
    false,
    "YYYY/MM/DD HH:mm"
  );
};

const getRunTimeTamp = ({ activeType, runAtTime, runEveryMins }) => {
  let timeTamp = strToTimeTamp(runAtTime);
  if (activeType === "timeIntervalTrigger") {
    timeTamp += toTimeTamp(runEveryMins);
  }
  return timeTamp;
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export default function TimeAlter() {
  const contextState = useContext(CodeTypeListContext) || {};
  const { nodeData, timeRgx } = contextState;
  const {
    activeType,
    runAtTime,
    ruleTimeType,
    endType,
    startTime,
    endTime,
    maxNum,
    timeZoneValue,
    notRunBefore,
    notRunAfter,
    runEveryMins,
  } = nodeData || {};
  const [state, setState] = useReducer(
    (oldVal, newVal) => ({ ...oldVal, ...newVal }),
    {
      errorContent: null,
      showListFlag: true,
      loading: false,
      timeList: [],
    }
  );
  const { errorContent, showListFlag, loading, timeList } = state;

  const getMaxNum = () => (maxNum > 10 ? 10 : maxNum);

  const getCurrentTime = () =>
    moment.utc(returnTimeStr(moment(), true, "YYYY/MM/DD HH:mm"));

  const getSetStartTime = () =>
    moment.utc(`${returnTimeStr(startTime)} ${runAtTime}`);

  const getEndTimeFlag = (time) => {
    const timeTamp = isNumber(time) ? time : time.valueOf();
    if (endType === "afterADate") {
      return endTime >= timeTamp;
    }
    return true;
  };

  const getNotRunTamp = (time) => {
    let notRunFlag = true;
    const newTime = isNumber(time) ? moment.utc(time) : time;
    const notRunBeforeTamp = strToTimeTamp(notRunBefore);
    const notRunAfterTamp = strToTimeTamp(notRunAfter);
    const hoursAndMinutesTimestamp =
      toTimeTamp(newTime.hours(), "hours") + toTimeTamp(newTime.minutes());
    if (activeType === "timeIntervalTrigger") {
      notRunFlag =
        notRunBeforeTamp <= hoursAndMinutesTimestamp &&
        hoursAndMinutesTimestamp <= notRunAfterTamp;
    }
    return notRunFlag;
  };

  const searchStartTime = ({
    currentTimeTamp,
    timeStartTamp,
    runEveryMins,
  }) => {
    let startTime = null;
    while (true && !startTime) {
      if (currentTimeTamp <= timeStartTamp) {
        startTime = timeStartTamp;
      }
      timeStartTamp += toTimeTamp(runEveryMins);
    }
    return startTime;
  };

  const splitDaysBasedOnMinutes = ({ time, times }) => {
    const startTime = time.clone().startOf("day");
    const endTime = time.clone().endOf("day");
    const currentTime = startTime.clone();
    while (
      currentTime.isBefore(endTime) &&
      times.length < getMaxNum() &&
      getEndTimeFlag(currentTime)
    ) {
      const runStartTime = searchStartTime({
        currentTimeTamp: getCurrentTime().valueOf(),
        timeStartTamp: getSetStartTime().valueOf(),
        runEveryMins,
      })
      if (getNotRunTamp(currentTime) && !currentTime.isBefore(runStartTime)) {
        times.push(
          `${retrunTimeFormat({
            time: currentTime.valueOf(),
            activeType,
            runEveryMins,
          })}`
        );
      }
      currentTime.add(runEveryMins, "minute");
    }
  };

  const returnErrorText = () => {
    let errorText = "";
    if (errorContent) {
      errorText = errorContent;
    } else if (runAtTime && !timeRgx.test(runAtTime)) {
      errorText = `TimeTrigger -> Time does not match "hh:ss" format`;
    } else if (notRunBefore && !timeRgx.test(notRunBefore)) {
      errorText = `Don't run before -> Time does not match "hh:ss" format`;
    } else if (notRunAfter && !timeRgx.test(notRunAfter)) {
      errorText = `Don't run after -> Time does not match "hh:ss" format`;
    } else if (endType === "afterADate" && endTime - startTime < 0) {
      errorText = `Earliest start (${returnTimeStr(
        startTime
      )}) must be <= until (${returnTimeStr(endTime)})`;
    } else if (
      notRunBefore &&
      notRunAfter &&
      strToTimeTamp(notRunBefore) > strToTimeTamp(notRunAfter)
    ) {
      errorText = `Don't run before must be <= Don't run after`;
    }
    return errorText;
  };

  const getCurrentStartMonthWeekDay = (currentDate) => {
    // 计算当月的第一天
    const firstDayOfMonth = currentDate.startOf("month");
    // 找到第一个工作日
    let firstWorkDay = firstDayOfMonth;
    while (isNotWeekDay(firstWorkDay)) {
      firstWorkDay = firstWorkDay.add(1, "day");
    }
    return firstWorkDay;
  };

  const getCurrentEndMonthWeekDay = (currentDate) => {
    // 计算当月的最后一天
    const lastDayOfMonth = currentDate.endOf("month");
    // 找到最后一个工作日
    let lastWorkDay = lastDayOfMonth;
    while (isNotWeekDay(lastWorkDay)) {
      lastWorkDay = lastWorkDay.subtract(1, "day");
    }
    return lastWorkDay;
  };

  const getCurrentStartWeekWeekDay = (currentDate) => {
    // 找到当周的第一个工作日，假设星期一到星期五是工作日
    let firstWorkDay = currentDate.clone().startOf("week");
    while (isNotWeekDay(firstWorkDay)) {
      firstWorkDay = firstWorkDay.add(1, "day");
    }
    return firstWorkDay;
  };

  const getCurrentEndWeekWeekDay = (currentDate) => {
    // 找到当周的最后一个工作日，假设星期一到星期五是工作日
    let lastWorkDay = currentDate.clone().endOf("week");
    while (isNotWeekDay(lastWorkDay)) {
      lastWorkDay = lastWorkDay.subtract(1, "day");
    }
    return lastWorkDay;
  };

  const returnStartTime = (data) => {
    const { isMonth, isEndOfMonth, isWeek, isEndWeek } = data || {};

    const currentTime = getCurrentTime(); // 当前时间
    const timeStart = getSetStartTime(); // 设置-开始时间
    const currentTimeTamp = currentTime.valueOf();
    const timeStartTamp = timeStart.valueOf();

    if (isMonth) {
      const fristWorkDayTamp =
        getCurrentStartMonthWeekDay(timeStart).valueOf() +
        getRunTimeTamp({ activeType, runAtTime, runEveryMins }); // 设置-开始时间的当月第一个工作日
      const flag = timeStartTamp <= fristWorkDayTamp;
      const time = flag
        ? timeStart
        : timeStart.add(1, "month").startOf("month");
      return { time };
    }

    if (isEndOfMonth) {
      const lastWorkDayTamp =
        getCurrentEndMonthWeekDay(timeStart).startOf("day").valueOf() +
        getRunTimeTamp({ activeType, runAtTime, runEveryMins }); // 设置-开始时间的当月最后一个工作日
      const flag = timeStartTamp <= lastWorkDayTamp;
      const time = flag
        ? timeStart
        : timeStart.add(1, "month").startOf("month");
      return { time };
    }

    if (isWeek) {
      const fristWeekDayTamp =
        getCurrentStartWeekWeekDay(timeStart).valueOf() +
        getRunTimeTamp({ activeType, runAtTime, runEveryMins }); // 设置-开始时间的当周第一个工作日
      const flag = timeStartTamp <= fristWeekDayTamp;
      const time = flag ? timeStart : timeStart.add(1, "week").startOf("week");
      return { time };
    }

    if (isEndWeek) {
      const lastWeekDayTamp =
        getCurrentEndWeekWeekDay(timeStart).startOf("day").valueOf() +
        getRunTimeTamp({ activeType, runAtTime, runEveryMins }); // 设置-开始时间的当周最后一个工作日
      const flag = timeStartTamp <= lastWeekDayTamp;
      const time = flag ? timeStart : timeStart.add(1, "week").startOf("week");
      return { time };
    }

    const flag = timeStartTamp > currentTimeTamp;
    let time = flag ? timeStartTamp : timeStartTamp + 86400000;
    if (activeType === "timeIntervalTrigger" && !flag) {
      time = searchStartTime({ currentTimeTamp, timeStartTamp, runEveryMins });
    }
    return { time };
  };

  const getEveryDay = () => {
    return new Promise((resolve) => {
      try {
        let times = [];
        let { time } = returnStartTime();
        while (times.length < getMaxNum() && getEndTimeFlag(time)) {
          if (getNotRunTamp(time)) {
            times.push(
              `${retrunTimeFormat({ time, activeType, runEveryMins })}`
            );
          }
          time += addTimeTamp({ tamp: 86400000, activeType, runEveryMins });
        }
        resolve(times);
      } catch (error) {
        resolve([]);
        setState({ errorContent: String(error) });
      }
    });
  };

  const getEvelyWorkingDay = () => {
    return new Promise((resolve) => {
      try {
        let times = [];
        let { time } = returnStartTime();
        while (times.length < getMaxNum() && getEndTimeFlag(time)) {
          if (!isNotWeekDay(moment.utc(time)) && getNotRunTamp(time)) {
            times.push(
              `${retrunTimeFormat({ time, activeType, runEveryMins })}`
            );
          }
          time += addTimeTamp({ tamp: 86400000, activeType, runEveryMins });
        }
        resolve(times);
      } catch (error) {
        resolve([]);
        setState({ errorContent: String(error) });
      }
    });
  };

  const getFirstWorkingDayOfTheMonth = () => {
    return new Promise((resolve) => {
      try {
        let times = [];
        let { time } = returnStartTime({ isMonth: true });
        const futureMonths = getMaxNum(); // 想要计算的未来月数
        for (let i = 0; i < futureMonths && getEndTimeFlag(time); i++) {
          while (isNotWeekDay(time)) {
            time.add(1, "day");
          }
          if (activeType === "timeIntervalTrigger") {
            // 根据runEveryMins进行分割
            splitDaysBasedOnMinutes({ time, times });
          } else {
            times.push(
              `${retrunTimeFormat({
                time: time.valueOf() + strToTimeTamp(runAtTime),
                activeType,
                runEveryMins,
              })}`
            );
          }

          time.add(1, "month").startOf("month");
        }
        resolve(times);
      } catch (error) {
        resolve([]);
        setState({ errorContent: String(error) });
      }
    });
  };

  const getFirstWorkingDayOfTheWeek = () => {
    return new Promise((resolve) => {
      try {
        let times = [];
        let { time } = returnStartTime({ isWeek: true });
        const futureWeeks = getMaxNum(); // 想要计算的未来周数
        for (let i = 0; i < futureWeeks && getEndTimeFlag(time); i++) {
          while (isNotWeekDay(time)) {
            time.add(1, "day");
          }
          if (activeType === "timeIntervalTrigger") {
            // 根据runEveryMins进行分割
            splitDaysBasedOnMinutes({ time, times });
          } else {
            times.push(
              `${retrunTimeFormat({
                time: time.valueOf() + strToTimeTamp(runAtTime),
                activeType,
                runEveryMins,
              })}`
            );
          }

          time.add(1, "week").startOf("week");
        }
        resolve(times);
      } catch (error) {
        resolve([]);
        setState({ errorContent: String(error) });
      }
    });
  };

  const getLastWorkingDayOfTheMonth = () => {
    return new Promise((resolve) => {
      try {
        let times = [];
        let { time } = returnStartTime({
          isEndOfMonth: true,
        });
        const untilLastWorkDay = getCurrentEndMonthWeekDay(
          moment.utc(endTime).endOf("day")
        ); // 设置-until时间当月的最后一个工作日

        const futureMonths = getMaxNum(); // 想要计算的未来月数
        for (let i = 0; i < futureMonths && getEndTimeFlag(time); i++) {
          time = time.endOf("month").startOf("day");
          while (isNotWeekDay(time)) {
            time.subtract(1, "day");
          }
          const endMonthFlag =
            endType === "afterADate"
              ? time.valueOf() <= untilLastWorkDay.valueOf() &&
                time.valueOf() <= endTime
              : true;
          if (endMonthFlag) {
            if (activeType === "timeIntervalTrigger") {
              // 根据runEveryMins进行分割
              splitDaysBasedOnMinutes({ time, times });
            } else {
              times.push(
                `${retrunTimeFormat({
                  time: time.valueOf() + strToTimeTamp(runAtTime),
                  activeType,
                  runEveryMins,
                })}`
              );
            }
          }
          time.add(1, "month").startOf("month");
        }
        resolve(times);
      } catch (error) {
        resolve([]);
        setState({ errorContent: String(error) });
      }
    });
  };

  const getLastWorkingDayOfTheWeek = () => {
    return new Promise((resolve) => {
      try {
        let times = [];
        let { time } = returnStartTime({ isEndWeek: true });
        const untilLastWeekDay = getCurrentEndWeekWeekDay(
          moment.utc(endTime).endOf("day")
        ); // 设置-until时间当周的最后一个工作日
        const futureWeeks = getMaxNum(); // 想要计算的未来周数
        for (let i = 0; i < futureWeeks && getEndTimeFlag(time); i++) {
          time = time.endOf("week").startOf("day");
          while (isNotWeekDay(time)) {
            time.subtract(1, "day");
          }
          const endWeekFlag =
            endType === "afterADate"
              ? time.valueOf() <= untilLastWeekDay.valueOf() &&
                time.valueOf() <= endTime
              : true;
          if (endWeekFlag) {
            if (activeType === "timeIntervalTrigger") {
              // 根据runEveryMins进行分割
              splitDaysBasedOnMinutes({ time, times });
            } else {
              times.push(
                `${retrunTimeFormat({
                  time: time.valueOf() + strToTimeTamp(runAtTime),
                  activeType,
                  runEveryMins,
                })}`
              );
            }
          }
          time.add(1, "week").startOf("week");
        }
        resolve(times);
      } catch (error) {
        resolve([]);
        setState({ errorContent: String(error) });
      }
    });
  };

  const getTimeList = async (flag) => {
    const errorText = returnErrorText();
    if (errorText) {
      return;
    }
    setState({ timeList: [], loading: true, errorContent: null });
    let times = [];
    if (ruleTimeType === "everyDay") {
      times = await getEveryDay();
    } else if (ruleTimeType === "everyWorkingDay") {
      times = await getEvelyWorkingDay();
    } else if (ruleTimeType === "firstWorkingDayOfTheMonth") {
      times = await getFirstWorkingDayOfTheMonth();
    } else if (ruleTimeType === "firstWorkingDayOfTheWeek") {
      times = await getFirstWorkingDayOfTheWeek();
    } else if (ruleTimeType === "lastWorkingDayOfTheMonth") {
      times = await getLastWorkingDayOfTheMonth();
    } else if (ruleTimeType === "lastWorkingDayOfTheWeek") {
      times = await getLastWorkingDayOfTheWeek();
    }
    await sleep(500);
    if (!flag) setState({ timeList: times, loading: false });
  };

  useEffect(() => {
    let flag = false;
    getTimeList(flag);
    return () => {
      flag = true;
    };
  }, [
    runAtTime,
    ruleTimeType,
    startTime,
    endType,
    endTime,
    maxNum,
    runEveryMins,
    notRunBefore,
    notRunAfter,
  ]);

  const errorText = returnErrorText();

  return (
    <div style={{ overflow: "hidden" }}>
      <Alert
        message={
          <>
            {errorText && (
              <div style={{ display: "flex", alignItems: "center" }}>
                <InfoCircleOutlined style={{ marginRight: 8 }} />
                {errorText}
              </div>
            )}
            {!errorText && (
              <div style={{ display: "flex" }}>
                <InfoCircleOutlined style={{ marginRight: 8, paddingTop: 8 }} />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      height: 30,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 14,
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>Next run:</div>
                    {timeList.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                          padding: "4px 8px",
                          userSelect: "none",
                        }}
                        onClick={() =>
                          setState({ showListFlag: !showListFlag })
                        }
                      >
                        <span style={{ marginRight: 4 }}>{`${
                          showListFlag ? "Hide" : "Show"
                        } next ${timeList.length} runs`}</span>
                        {showListFlag ? <UpOutlined /> : <DownOutlined />}
                      </div>
                    )}
                  </div>
                  {loading && <Spin spinning={loading} />}
                  {showListFlag && !loading && (
                    <>
                      <div style={{ marginBottom: 8 }}>
                        Timezone: {timeZoneValue}
                      </div>
                      <div style={{ fontSize: 14 }}>
                        {timeList.length > 0 &&
                          R.map((item) => {
                            return <div key={item}>{item}</div>;
                          }, timeList)}
                        {timeList.length === 0 && <div>None scheduled.</div>}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        }
        type={errorText ? "error" : "info"}
        style={{ margin: "10px 0 20px 0" }}
      />
    </div>
  );
}
