import React, { createContext, useMemo, useReducer } from "react";
import * as R from "ramda";
import moment from "moment";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import { rootSelectInfos, ordinarySelectInfos } from "./data";

import CodeTypeHeader from "./components/CodeTypeHeader";
import TypeList from "./components/TypeList";

const CodeTypeListContext = createContext(null);
const CodeTypeDispatchContext = createContext(null);

const timeNameOprion = R.map(
  (item) => ({ label: item, value: item }),
  moment.tz.names() || []
);

export default function CodeTypeList({ isRoot = true }) {
  const [state, setState] = useReducer(
    (oldVal, newVal) => ({ ...oldVal, ...newVal }),
    {
      timeRgx: /^([0-1]{1}[0-9]|2[0-3]):[0-5][0-9]$/,
      timeNameOprion,
      ruleTimeTypeOption: [
        { value: "everyDay", label: "Every day" },
        { value: "everyWorkingDay", label: "Every working day" },
        {
          value: "firstWorkingDayOfTheMonth",
          label: "First working day of the month",
        },
        {
          value: "firstWorkingDayOfTheWeek",
          label: "First working day of the week",
        },
        {
          value: "lastWorkingDayOfTheMonth",
          label: "Last working day of the month",
        },
        {
          value: "lastWorkingDayOfTheWeek",
          label: "Last working day of the week",
        },
      ],
      endType: [
        { value: "never", label: "Never" },
        { value: "afterADate", label: "After a date" },
        {
          value: "afterNumberOfRuns",
          label: "After number of runs",
        },
      ],
      searchVal: "",
      activeTypeItem: null,
      nodeData: {},
    }
  );
  const { searchVal, activeTypeItem } = state;

  const typeList = useMemo(() => {
    const dataMap = isRoot ? rootSelectInfos() : ordinarySelectInfos();
    let typeList = R.values(dataMap || {});

    typeList = R.filter((item) => {
      item.dataList = R.filter(
        (_item) =>
          _item.title.toUpperCase().indexOf(searchVal.toUpperCase()) !== -1,
        item.dataList || []
      );
      return item.dataList.length > 0;
    }, typeList || []);

    return typeList;
  }, [isRoot, searchVal]);

  return (
    <CodeTypeListContext.Provider value={state}>
      <CodeTypeDispatchContext.Provider value={setState}>
        <div
          style={{
            height: "100%",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            padding: "8px 0px 8px 8px",
          }}
        >
          {!activeTypeItem && (
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {isRoot && (
                <>
                  <CodeTypeHeader
                    title="Select a trigger"
                    desc="Triggers start the execution of a workflow. They can listen for events or be scheduled to run at fixed times or intervals."
                  />
                  <Input
                    size="small"
                    placeholder="Search triggers"
                    prefix={<SearchOutlined />}
                    style={{ maxWidth: 400, marginBottom: 16 }}
                    onChange={({ target: { value } }) =>
                      setState({ searchVal: value })
                    }
                  />
                  <TypeList typeList={typeList} />
                </>
              )}
              {!isRoot && (
                <>
                  <CodeTypeHeader
                    title="Choose action"
                    desc="Add a task to the workflow and select the action it performs."
                  />
                  <Input
                    size="small"
                    placeholder="Search actions"
                    prefix={<SearchOutlined />}
                    style={{ maxWidth: 400, marginBottom: 16 }}
                    onChange={({ target: { value } }) =>
                      setState({ searchVal: value })
                    }
                  />
                  <TypeList typeList={typeList} />
                </>
              )}
            </div>
          )}
          {activeTypeItem && activeTypeItem.component()}
        </div>
      </CodeTypeDispatchContext.Provider>
    </CodeTypeListContext.Provider>
  );
}

export { CodeTypeListContext, CodeTypeDispatchContext };
