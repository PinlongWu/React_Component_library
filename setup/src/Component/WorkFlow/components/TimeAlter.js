import React, { useContext, useEffect, useReducer } from "react";
import * as R from "ramda";
import moment from "moment";
import business from "moment-business";
import { Alert, Spin } from "antd";

import { CodeTypeListContext } from "../CodeTypeList";
import {
  DownOutlined,
  InfoCircleOutlined,
  UpOutlined,
} from "@ant-design/icons";

const returnTimeStr = (time) => moment.utc(time).format("YYYY/MM/DD");

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export default function TimeAlter() {
  const contextState = useContext(CodeTypeListContext) || {};
  const { nodeData, timeRgx } = contextState;
  const { runAtTime, ruleTimeType, endType, startTime, endTime } =
    nodeData || {};
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
    } else if (endType === "After a date" && endTime - startTime < 0) {
      errorText = `Earliest start (${returnTimeStr(
        startTime
      )}) must be <= until (${returnTimeStr(endTime)})`;
    }
    return errorText;
  };

  const getEveryDay = () => {
    return new Promise((resolve) => {
      try {
        let times = [];
        const currentTimeTamp = moment.utc().valueOf();
        const timeStartStr = `${returnTimeStr(startTime)} ${runAtTime}`;
        let time =
          moment.utc(timeStartStr).valueOf() > currentTimeTamp
            ? startTime
            : startTime + 86400000;
        while (
          times.length < 10 &&
          (endType === "After a date" ? endTime >= time : true)
        ) {
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
        const currentTimeTamp = moment.utc().valueOf();
        const timeStartStr = `${returnTimeStr(startTime)} ${runAtTime}`;
        let time =
          moment.utc(timeStartStr).valueOf() > currentTimeTamp
            ? startTime
            : startTime + 86400000;
        while (
          times.length < 10 &&
          (endType === "After a date" ? endTime >= time : true)
        ) {
          if (business.isWeekDay(moment.utc(time)))
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

  const getFirstWorkingDayOfTheMonth = () => {
    return new Promise((resolve) => {});
  };

  const getFirstWorkingDayOfTheWeek = () => {
    return new Promise((resolve) => {});
  };

  const getLastWorkingDayOfTheMonth = () => {
    return new Promise((resolve) => {});
  };

  const getLastWorkingDayOfTheWeek = () => {
    return new Promise((resolve) => {});
  };

  const getTimeList = async (flag) => {
    const errorText = returnErrorText();
    if (errorText) {
      return;
    }
    setState({ timeList: [], loading: true, errorContent: null });
    let times = [];
    if (ruleTimeType === "Every day") {
      times = await getEveryDay();
    } else if (ruleTimeType === "Every working day") {
      times = await getEvelyWorkingDay();
    } else if (ruleTimeType === "First working day of the month") {
      times = await getFirstWorkingDayOfTheMonth();
    } else if (ruleTimeType === "First working day of the week") {
      times = await getFirstWorkingDayOfTheWeek();
    } else if (ruleTimeType === "Last working day of the month") {
      times = await getLastWorkingDayOfTheMonth();
    } else if (ruleTimeType === "Last working day of the week") {
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
  }, [runAtTime, ruleTimeType, startTime, endType, endTime]);

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
                    <div style={{ fontSize: 14 }}>
                      {timeList.length > 0 &&
                        R.map((item) => {
                          return <div key={item}>{item}</div>;
                        }, timeList)}
                      {timeList.length === 0 && <div>None scheduled.</div>}
                    </div>
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
