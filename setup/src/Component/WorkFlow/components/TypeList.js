import React, { useContext } from "react";
import * as R from "ramda";

import { CodeTypeDispatchContext, CodeTypeListContext } from "../CodeTypeList";

export default function TypeList({ typeList }) {
  const contextSetState = useContext(CodeTypeDispatchContext);
  const contextState = useContext(CodeTypeListContext) || {};
  const { nodeData } = contextState;

  return (
    <div style={{ userSelect: "none", flex: 1, overflowY: "scroll" }}>
      {R.addIndex(R.map)((typeInfo, typeIdx) => {
        const { title, dataList } = typeInfo;
        return (
          <div key={title}>
            <div
              style={{
                fontSize: 16,
                fontWeight: "bold",
                ...(typeIdx !== 0 ? { marginTop: 16 } : {}),
              }}
            >
              {title}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {R.addIndex(R.map)((item, idx) => {
                const { id, title, desc, icon, isRoot, initData } = item;
                return (
                  <div
                    key={id}
                    onClick={() =>
                      contextSetState({
                        activeTypeItem: item,
                        nodeData: { ...initData, isRoot, activeType: id },
                      })
                    }
                    style={{
                      width: 300,
                      padding: 8,
                      display: "flex",
                      cursor: "pointer",
                      alignItems: "center",
                      overflow: "hidden",
                      flexShrink: 0,
                      marginRight: 26,
                    }}
                  >
                    <div
                      style={{
                        width: 50,
                        height: 50,
                        textAlign: "center",
                        lineHeight: "50px",
                        fontSize: 24,
                        borderRadius: 8,
                        marginRight: 8,
                        background: "#efefef",
                        flexShrink: 0,
                      }}
                    >
                      {icon}
                    </div>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: "bold",
                          wordBreak: "keep-all",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {title}
                      </div>
                      <div style={{ fontSize: 12, wordBreak: "break-word" }}>
                        {desc}
                      </div>
                    </div>
                  </div>
                );
              }, dataList || [])}
            </div>
          </div>
        );
      }, typeList || [])}
    </div>
  );
}
