import React, { useMemo, useReducer } from "react";
import * as R from "ramda";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import { rootSelectInfos, ordinarySelectInfos } from "./data";

import CodeTypeHeader from "./components/CodeTypeHeader";
import TypeList from "./components/TypeList";

export default function CodeTypeList({ isRoot = true }) {
  const [state, setState] = useReducer(
    (oldVal, newVal) => ({ ...oldVal, ...newVal }),
    {
      searchVal: "",
    }
  );
  const { searchVal } = state;

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
    <div style={{ padding: 8 }}>
      {isRoot && (
        <div>
          <CodeTypeHeader
            title="Select a trigger"
            desc="Triggers start the execution of a workflow. They can listen for events or be scheduled to run at fixed times or intervals."
          />
          <Input
            size="small"
            placeholder="Search triggers"
            prefix={<SearchOutlined />}
            style={{ maxWidth: 400, marginBottom: 16 }}
            onChange={({ target: { value } }) => setState({ searchVal: value })}
          />
          <TypeList typeList={typeList} />
        </div>
      )}
      {!isRoot && (
        <div>
          <CodeTypeHeader
            title="Choose action"
            desc="Add a task to the workflow and select the action it performs."
          />
          <Input
            size="small"
            placeholder="Search actions"
            prefix={<SearchOutlined />}
            style={{ maxWidth: 400, marginBottom: 16 }}
            onChange={({ target: { value } }) => setState({ searchVal: value })}
          />
          <TypeList typeList={typeList} />
        </div>
      )}
    </div>
  );
}
