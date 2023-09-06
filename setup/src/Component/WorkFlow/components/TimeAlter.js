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

const returnTimeStr = (time, noUTC, accurate) => {
  let format = "YYYY/MM/DD";
  if(accurate){
    format += ' HH:mm:ss'
  }
  if (noUTC) {
    return time.format(format);
  }
  return moment.utc(time).format(format);
};
const isNotWeekDay = (time) => time.day() === 0 || time.day() === 6; // // 如果当前日期是周末（0表示星期日，6表示星期六）
const toTimeTamp = (timeStr) => moment.duration(timeStr).asMilliseconds();

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export default function TimeAlter() {
  const contextState = useContext(CodeTypeListContext) || {};
  const { nodeData, timeRgx } = contextState;
  const {
    runAtTime,
    ruleTimeType,
    endType,
    startTime,
    endTime,
    maxNum,
    timeZoneValue,
    notRunBefore,
    notRunAfter
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

  const returnErrorText = () => {
    let errorText = "";
    if (errorContent) {
      errorText = errorContent;
    } else if (!timeRgx.test(runAtTime)) {
      errorText = `TimeTrigger -> Time does not match "hh:ss" format`;
    } else if (endType === "afterADate" && endTime - startTime < 0) {
      errorText = `Earliest start (${returnTimeStr(
        startTime
      )}) must be <= until (${returnTimeStr(endTime)})`;
    }else if(toTimeTamp(notRunBefore) > toTimeTamp(notRunAfter)){
      errorText = `Don't run before must be <= Don't run after`
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
    const currentTime = moment.utc(returnTimeStr(moment(), true, true)); // 当前时间

    const timeStartStr = `${returnTimeStr(startTime)} ${runAtTime}`; // 设置-开始时间
    const timeStartTamp = moment.utc(timeStartStr).valueOf(); // 设置-开始时间戳
    const fristWorkDay = getCurrentStartMonthWeekDay(moment.utc(timeStartStr)); // 设置-开始时间的当月第一个工作日
    const lastWorkDay = getCurrentEndMonthWeekDay(moment.utc(timeStartStr)); // 设置-开始时间的当月最后一个工作日
    const fristWeekDay = getCurrentStartWeekWeekDay(moment.utc(timeStartStr)); // 设置-开始时间的当周第一个工作日
    const lastWeekDay = getCurrentEndWeekWeekDay(moment.utc(timeStartStr)); // 设置-开始时间的当周最后一个工作日
    const untilLastWorkDay = getCurrentEndMonthWeekDay(
      moment.utc(endTime).endOf("day")
    ); // 设置-until时间当月的最后一个工作日
    const untilLastWeekDay = getCurrentEndWeekWeekDay(
      moment.utc(endTime).endOf("day")
    ); // 设置-until时间当周的最后一个工作日

    let flag = timeStartTamp > currentTime.valueOf();
    if (isMonth) {
      flag = timeStartTamp <= fristWorkDay.valueOf();
    }
    if (isEndOfMonth) {
      flag = timeStartTamp <= lastWorkDay.startOf("day").valueOf();
    }
    if (isWeek) {
      flag = timeStartTamp <= fristWeekDay.valueOf();
    }
    if (isEndWeek) {
      flag = timeStartTamp <= lastWeekDay.startOf("day").valueOf();
    }

    let time = flag ? startTime : startTime + 86400000; // flag: true 就用当前时间开始算，否则加一天开始算
    if (isMonth) {
      time = flag
        ? moment.utc(startTime)
        : moment.utc(startTime).add(1, "month").startOf("month");
    }
    if (isWeek) {
      time = flag
        ? moment.utc(startTime)
        : moment.utc(startTime).add(1, "week").startOf("week");
    }

    return { time, untilLastWorkDay, untilLastWeekDay };
  };

  const getMaxNum = () => (maxNum > 10 ? 10 : maxNum);
  const getEndTimeFlag = (time) =>
    endType === "afterADate"
      ? endTime >= (isNumber(time) ? time : time.valueOf())
      : true;

  const getEveryDay = () => {
    return new Promise((resolve) => {
      try {
        let times = [];
        let { time } = returnStartTime();
        while (times.length < getMaxNum() && getEndTimeFlag(time)) {
          times.push(`${returnTimeStr(time)} ${runAtTime}`);
          time += 86400000;
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
          if (!isNotWeekDay(moment.utc(time)))
            times.push(`${returnTimeStr(time)} ${runAtTime}`); // 判断是否是工作日
          time += 86400000;
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
          let nextWorkday = time.startOf("month");
          while (isNotWeekDay(nextWorkday)) {
            nextWorkday.add(1, "day");
          }
          times.push(`${returnTimeStr(nextWorkday, true)} ${runAtTime}`);
          time.add(1, "month");
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
          times.push(`${returnTimeStr(time, true)} ${runAtTime}`);
          time.add(1, "week");
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
        let { time, untilLastWorkDay } = returnStartTime({
          isMonth: true,
          isEndOfMonth: true,
        });
        const futureMonths = getMaxNum(); // 想要计算的未来月数
        for (let i = 0; i < futureMonths && getEndTimeFlag(time); i++) {
          let nextWorkday = time.endOf("month").startOf("day");
          while (isNotWeekDay(nextWorkday)) {
            nextWorkday.subtract(1, "day");
          }
          const endMonthFlag =
            endType === "afterADate"
              ? nextWorkday.valueOf() <= untilLastWorkDay.valueOf() &&
                nextWorkday.valueOf() <= endTime
              : true;
          if (endMonthFlag) {
            times.push(`${returnTimeStr(nextWorkday, true)} ${runAtTime}`);
          }
          time.add(1, "month");
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
        let { time, untilLastWeekDay } = returnStartTime({
          isWeek: true,
          isEndWeek: true,
        });
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
            times.push(`${returnTimeStr(time, true)} ${runAtTime}`);
          }
          time.add(1, "week");
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
  }, [runAtTime, ruleTimeType, startTime, endType, endTime, maxNum]);

  const errorText = returnErrorText();

  return (
    <div style={{ overflow: "hidden" }}>
      <Alert
        message={
          <>
            {errorText && <div>{errorText}</div>}
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
        type="info"
        style={{ margin: "10px 0 20px 0" }}
      />
    </div>
  );
}
