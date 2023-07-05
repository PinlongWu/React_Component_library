import { Button, Input } from "antd";
import React, { useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";

const SOCKET_URL_ONE = "wss://echo.websocket.events";
const SOCKET_URL_TWO = "wss://demos.kaazing.com/echo";

// 异步返回ws url
const generateAsyncUrlGetter =
  (url, timeout = 2000) =>
  () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(url);
      }, timeout);
    });
  };

export default function Websocket() {
  const [currentSocketUrl, setCurrentSocketUrl] = useState(null); // 存储ws url
  const [messageHistory, setMessageHistory] = useState([]); // 存储 ws 返回的值
  const [inputVal, setInputVal] = useState(""); // input 值
  const didUnmount = useRef(false); // 重连开关

  // sendMessage 发送函数 (message: string, keep: boolean = true) => void;
  // sendJsonMessage 发送json数据 自动会JSON.stringify (message: any, keep: boolean = true) => void;
  // lastMessage 返回的最后消息内容
  // lastJsonMessage 返回的最后Json消息内容
  // readyState 状态码
  // getWebSocket 获取ws实例
  const {
    sendMessage,
    sendJsonMessage,
    lastMessage,
    lastJsonMessage,
    readyState,
    getWebSocket,
  } = useWebSocket(currentSocketUrl, {
    share: true,
    // retryOnError: true, // 发生错误事件时重新连接
    shouldReconnect: (closeEvent) => {
      return didUnmount.current === false;
    }, // 重连回调函数
    reconnectAttempts: 2, // 重连次数
    reconnectInterval: 3000, // 重连间隔时间 (ms) 也可以是一个函数

    //attemptNumber will be 0 the first time it attempts to reconnect, so this equation results in a reconnect pattern of 1 second, 2 seconds, 4 seconds, 8 seconds, and then caps at 10 seconds until the maximum number of attempts is reached
    // reconnectInterval: (attemptNumber) =>
    //   Math.min(Math.pow(2, attemptNumber) * 1000, 10000),

    // onReconnectStop: (numAttempted) => {}, // 当 websocket 超过重新连接限制时将被调用

    filter: (message) => {
      if (message.data !== "echo.websocket.events sponsored by Lob.com")
        return true;
    }, // 过滤返回值
    // onOpen: (event) => console.log(event, "onOpen"),
    // onClose: (event) => console.log(event, "onClose"),
    // onMessage: (event) => console.log(event, "onMessage"),
    // onError: (event) => console.log(event, "onError"),
  });

  // 映射状态
  const readyStateString = {
    // -1:'不是有效的ws连接',
    0: "连接中",
    1: "打开",
    2: "关闭",
    3: "已关闭",
  }[readyState];

  // 发送消息
  const handleSendMessage = () => {
    sendMessage(inputVal);
  };

  const handleSendJsonMessage = () => {
    sendJsonMessage({ name: "wpl", age: 24 });
  };

  // 通过实例发送需要把 share 关掉
  //   const handleExampleSendMessage = () => {
  //     getWebSocket().send("getWebSocket");
  //   };

  // 触发连接
  const handleConnect = (url) => {
    setMessageHistory([]);
    setCurrentSocketUrl(generateAsyncUrlGetter(url));
  };

  // 接收返回值
  useEffect(() => {
    lastMessage && setMessageHistory((prev) => prev.concat(lastMessage.data));
  }, [lastMessage]);

  useEffect(() => {
    setMessageHistory([]);
    setCurrentSocketUrl(generateAsyncUrlGetter(SOCKET_URL_ONE));
    return () => {
      didUnmount.current = true;
    };
  }, []);

  return (
    <div>
      <Input
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        style={{ width: 200 }}
      />
      <Button onClick={handleSendMessage}>发送信息</Button>
      <Button onClick={handleSendJsonMessage}>发送Json信息</Button>
      {/* <Button onClick={handleExampleSendMessage}>通过ws实例发送信息</Button> */}

      <div>
        <Button onClick={() => handleConnect(SOCKET_URL_ONE)}>
          {SOCKET_URL_ONE}
        </Button>
        <Button onClick={() => handleConnect(SOCKET_URL_TWO)}>
          {SOCKET_URL_TWO}
        </Button>
      </div>

      <div>ReadyState: {readyStateString}</div>
      <div>Data:{messageHistory}</div>
      <br />
      <ChildBox />
    </div>
  );
}

const ChildBox = ({}) => {
  const [currentSocketUrl, setCurrentSocketUrl] = useState(null); // 存储ws url
  const [messageHistory, setMessageHistory] = useState([]); // 存储 ws 返回的值
  const [inputVal, setInputVal] = useState("");

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    currentSocketUrl,
    {
      share: true,
      shouldReconnect: (closeEvent) => true, // 重连回调函数
      reconnectAttempts: 2, // 重连次数
      reconnectInterval: 3000, // 重连间隔时间 (ms) 也可以是一个函数
      filter: (message) => {
        if (message.data !== "echo.websocket.events sponsored by Lob.com")
          return true;
      }, // 过滤返回值
    }
  );

  // 触发连接
  const handleConnect = (url) => {
    setMessageHistory([]);
    setCurrentSocketUrl(generateAsyncUrlGetter(url));
  };

  // 发送消息
  const handleSendMessage = () => {
    sendMessage(inputVal);
  };

  // 接收返回值
  useEffect(() => {
    lastMessage && setMessageHistory((prev) => prev.concat(lastMessage.data));
  }, [lastMessage]);

  useEffect(() => {
    setMessageHistory([]);
    setCurrentSocketUrl(generateAsyncUrlGetter(SOCKET_URL_ONE));
  }, []);

  // 映射状态
  const readyStateString = {
    // -1:'不是有效的ws连接',
    0: "连接中",
    1: "打开",
    2: "关闭",
    3: "已关闭",
  }[readyState];

  return (
    <div>
      <h1>我是child</h1>
      <Input
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        style={{ width: 200 }}
      />
      <Button onClick={handleSendMessage}>发送信息</Button>

      <div>
        <Button onClick={() => handleConnect(SOCKET_URL_ONE)}>
          {SOCKET_URL_ONE}
        </Button>
        <Button onClick={() => handleConnect(SOCKET_URL_TWO)}>
          {SOCKET_URL_TWO}
        </Button>
      </div>

      <div>ReadyState: {readyStateString}</div>
      <div>Data:{messageHistory}</div>
    </div>
  );
};
