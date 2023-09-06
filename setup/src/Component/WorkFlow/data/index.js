import {
  AlertOutlined,
  DeploymentUnitOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";

import { eventTriggerInitData, fixedTimeTriggerInitData, timeIntervalTriggerInitData } from "./initData";

import EventTrigger from "../components/EventTrigger";
import FixedTimeTrigger from "../components/FixedTimeTrigger";
import TimeIntervalTrigger from "../components/TimeIntervalTrigger";

export const rootSelectInfos = () => {
  return {
    event: {
      title: "Event",
      dataList: [
        {
          isRoot: true,
          id: "eventTrigger",
          title: "Event trigger",
          icon: <AlertOutlined />,
          initData: eventTriggerInitData,
          desc: "Run workflow based on a custom event filter.",
          component: () => <EventTrigger />,
        },
      ],
    },
    schedule: {
      title: "Schedule",
      dataList: [
        {
          isRoot: true,
          id: "fixedTimeTrigger",
          title: "Fixed time trigger",
          icon: <FieldTimeOutlined />,
          initData: fixedTimeTriggerInitData,
          desc: "Run workflow at a fixed time of day.",
          component: () => <FixedTimeTrigger />,
        },
        {
          isRoot: true,
          id: "timeIntervalTrigger",
          title: "Time interval trigger",
          icon: <FieldTimeOutlined />,
          initData: timeIntervalTriggerInitData,
          desc: "Run workflow at fixed time intervals.",
          component: () => <TimeIntervalTrigger />,
        },
      ],
    },
  };
};

export const ordinarySelectInfos = () => {
  return {
    workflows: {
      title: "Workflows",
      dataList: [
        {
          isRoot: false,
          id: "executeDQLQuery",
          title: "Execute DQL Query",
          icon: <DeploymentUnitOutlined />,
          desc: "Executes DQL query",
          component: () => {},
        },
        {
          isRoot: false,
          id: "httpRequest",
          title: "HTTP Request",
          icon: <DeploymentUnitOutlined />,
          desc: "Issue an HTTP request to any API",
          component: () => {},
        },
        {
          isRoot: false,
          id: "runJavascript",
          title: "Run Javascript",
          icon: <DeploymentUnitOutlined />,
          desc: "Build a custom task running js Code",
          component: () => {},
        },
      ],
    },
  };
};
