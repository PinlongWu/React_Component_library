import React, { useReducer } from "react";
import * as R from "ramda";
import moment from "moment";
import momentzz from "moment-timezone";
import { Select } from "antd";

import BackHome from "../BackHome/BackHome";

export default function TimeTest() {
  const [state, setState] = useReducer(
    (oldVal, newVal) => ({ ...oldVal, ...newVal }),
    {
      timeNameOprion: R.map(
        (item) => ({ label: item, value: item }),
        moment.tz.names() || []
      ),
      timeZoneValue: "",
    }
  );
  const { timeNameOprion, timeZoneValue } = state;

  console.log("获取现在时间");
  console.log(moment().format("YYYY-MM-DD HH:mm:ss"));
  console.log(momentzz().format("YYYY-MM-DD HH:mm:ss"));

  console.log("获取现在的时间戳");
  console.log(moment().valueOf());
  console.log(momentzz().valueOf());

  console.log("时间戳展示其他时区的时间");
  // 时间戳转为时间字符串：因为每个时区在当前时间戳展示的时间都不一样，但是他们的时戳都是一样的
  // 比如：当前时间戳1671282000000(在上海时间是:2022-12-17 21:00:00,那么在纽约是:2022-12-17 8:00:00。因为有13个小时时差)
  // 常见案例：上海时间2022-12-17 21:00:00展示在纽约时间是多少
  const timeTemp = moment().valueOf();
  console.log(
    momentzz(timeTemp).tz("America/New_York").format("YYYY-MM-DD HH:mm:ss")
  );
  console.log(
    momentzz(timeTemp).tz("Asia/Shanghai").format("YYYY-MM-DD HH:mm:ss")
  );

  console.log("时间字符串转为时间戳");
  // 时间字符串转为时间戳：全部时区都在这个时间，他们的时间戳都是相同的，因为全部时区只是有时差，但是都到达这个点时间戳都是一样的
  // 比如：2022-12-17 21:00:00(在上海这个点时时间戳是:1671282000000,那么在纽约这个时间点也是:1671282000000)
  const timeStr = "2022-12-17 21:00:00";
  console.log(momentzz(timeStr).tz("America/New_York").valueOf());
  console.log(momentzz(timeStr).tz("Asia/Shanghai").valueOf());

  console.log("moment.tz -------- 1.时间戳展示其他时区的时间");
  // 查看momentzz(xxx).tz(xxx) 和 momentzz.tz(xxx,xxx)的区别：https://zhuanlan.zhihu.com/p/518051998
  // 简单的来说：momentzz(xxx).tz(xxx)是把xx时间转为xx时区的，momentzz.tz(xxx,xxx)是把xx时间创建为xx时区的
  // momentzz(xxx).tz(sss)不会改变xxx时间, momentzz.tz(xxx,sss)会改变xxx时间，所以momentzz.tz(xxx,xxx).啥都会改变
  // 这个案例：把2022-12-17 21:00:00创建为纽约和上海的时间，纽约这个时间为2022-12-17 8:00:00。因为有13个小时时差
  console.log(
    moment.tz(timeTemp, "America/New_York").format("YYYY-MM-DD HH:mm:ss")
  );
  console.log(
    moment.tz(timeTemp, "Asia/Shanghai").format("YYYY-MM-DD HH:mm:ss")
  );

  console.log("moment.tz -------- 2.时间字符串转为时间戳");
  // 把当前时间字符串创建为其他时区的时间
  // 比如：上海时间：2022-12-17 21:00:00，创建为纽约的这个2022-12-17 21:00:00点，所以下面的时间戳时不一样的，有13个小时差
  // 常见案例：获取时间在指定时区的时间戳
  console.log(moment.tz(timeStr, "America/New_York").valueOf());
  console.log(moment.tz(timeStr, "Asia/Shanghai").valueOf());
  // 为什么时间字符串转时间字符串会一样尼，废话！momentzz.tz(xxx,sss)不就是把2022-12-17 21:00:00创建为别的时区这个时间，难道不一样吗？
  console.log(
    moment.tz(timeStr, "America/New_York").format("YYYY-MM-DD HH:mm:ss")
  );
  console.log(
    moment.tz(timeStr, "Asia/Shanghai").format("YYYY-MM-DD HH:mm:ss")
  );

  // 这个案例意思是：把纽约的2022-12-17 21:00:00的时间戳，创建为上海的时间(上海在纽约这个时间为：2022-12-18 10:00:00，因为上海比纽约快13小时)
  console.log(
    moment
      .tz(moment.tz(timeStr, "America/New_York").valueOf(), "Asia/Shanghai")
      .format("YYYY-MM-DD HH:mm:ss")
  );
  console.log(
    moment
      .tz(moment.tz(timeStr, "Asia/Shanghai").valueOf(), "Asia/Shanghai")
      .format("YYYY-MM-DD HH:mm:ss")
  );

  const timeSeg = (
    startT = 1690892100000,
    endT = 1690892280000,
    interval = 2
  ) => {
    let starTime = moment.utc(startT);
    let endTime = moment.utc(endT);
    let diff = endTime.diff(starTime, "minutes") + interval;
    let num = Math.ceil(diff / interval);
    var segs = [];
    for (let i = 1; i <= num; i++) {
      let timeFrom = starTime.clone().add((i - 1) * interval, "minutes");
      const isAfter = timeFrom.isAfter(moment.utc(endT));
      if(isAfter){
        timeFrom = moment.utc(endT)
      }
      segs.push({
        timeFrom: timeFrom.format("HH:mm"),
        sT: timeFrom.valueOf(),
      });
    }
    return segs;
  };
  console.log(timeSeg(), "timeSeg");

  return (
    <>
      <BackHome></BackHome>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div>TimeTest:</div>
        <div>
          <Select
            showSearch
            value={timeZoneValue}
            options={timeNameOprion}
            style={{ width: 300 }}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            onChange={(timeZoneValue) => setState({ timeZoneValue })}
          />
          {timeZoneValue}
        </div>
      </div>
    </>
  );
}
