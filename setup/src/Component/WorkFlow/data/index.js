import {
  AlertOutlined,
  DeploymentUnitOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";

import EventTrigger from "../components/EventTrigger";
import FixedTimeTrigger from "../components/FixedTimeTrigger";
import TimeIntervalTrigger from "../components/TimeIntervalTrigger";

export const rootSelectInfos = () => {
  return {
    event: {
      title: "Event",
      dataList: [
        {
          id: "eventTrigger",
          title: "Event trigger",
          icon: <AlertOutlined />,
          desc: "Run workflow based on a custom event filter.",
          component: () => <EventTrigger />,
        },
      ],
    },
    schedule: {
      title: "Schedule",
      dataList: [
        {
          id: "fixedTimeTrigger",
          title: "Fixed time trigger",
          icon: <FieldTimeOutlined />,
          desc: "Run workflow at a fixed time of day.",
          component: () => <FixedTimeTrigger />,
        },
        {
          id: "timeIntervalTrigger",
          title: "Time interval trigger",
          icon: <FieldTimeOutlined />,
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
          id: "executeDQLQuery",
          title: "Execute DQL Query",
          icon: <DeploymentUnitOutlined />,
          desc: "Executes DQL query",
          component: () => {},
        },
        {
          id: "httpRequest",
          title: "HTTP Request",
          icon: <DeploymentUnitOutlined />,
          desc: "Issue an HTTP request to any API",
          component: () => {},
        },
        {
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
