import React, { useEffect, useReducer } from "react";
import { debounce } from "lodash";

import BackHome from "../BackHome/BackHome";

export default function Index() {
  const [state, setState] = useReducer(
    (oldVal, newVal) => ({ ...oldVal, ...newVal }),
    {
      refresh: false,
    }
  );
  const { refresh } = state;
  const resizeViewSize = () => {
    const whdef = 100 / 1680; // 表示1680的设计图,使用100PX的默认值 1rem = 100px
    const wW = document.documentElement.clientWidth; // 当前窗口的宽度
    const rem = wW * whdef; // 以默认比例值乘以当前窗口宽度,得到该宽度下的相应FONT-SIZE值
    document.getElementsByClassName("emView")[0].style.fontSize = `${rem}px`;
    setState({ refresh: true });
  };

  const emToPx = (size) => {
    return size * (document.documentElement.clientWidth * (100 / 1680));
  };

  useEffect(() => {
    resizeViewSize();
    window.addEventListener("resize", debounce(resizeViewSize, 200));
    return () => {
      window.removeEventListener("resize", resizeViewSize);
    };
  }, []);

  useEffect(() => {
    if (refresh) {
      setTimeout(() => setState({ refresh: false }));
    }
  }, [refresh]);

  return (
    <>
      <BackHome></BackHome>
      <div className="emView">
        <div style={{ fontSize: emToPx(0.12) }}>
          我是em，根据父元素的fontSize变化而变化
        </div>
      </div>
    </>
  );
}
