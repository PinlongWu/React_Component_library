import React, { useContext } from "react";
import { Controlled as CodeMirror } from "react-codemirror2";

import { CodeTypeListContext, CodeTypeDispatchContext } from "../CodeTypeList";

// 代码折叠
import "codemirror/addon/fold/foldcode.js";
import "codemirror/addon/fold/foldgutter.js";
import "codemirror/addon/fold/brace-fold.js";
import "codemirror/addon/fold/comment-fold.js";
import "codemirror/addon/fold/foldgutter.css";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";

// 代码模式，clike是包含java,c++等模式的
import "codemirror/mode/clike/clike";
import "codemirror/mode/sql/sql";
import "codemirror/mode/javascript/javascript";

export default function CodeMirrorEditor({ mode }) {
  const contextSetState = useContext(CodeTypeDispatchContext);
  const contextState = useContext(CodeTypeListContext) || {};
  const { nodeData } = contextState;

  return (
    <div
      style={{
        border: "1px solid rgb(218, 220, 224)",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <CodeMirror
        options={{
          lineNumbers: true,
          mode,
          foldGutter: true,
          gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        }}
        value={nodeData.codeContent}
        onBeforeChange={(editor, data, value) =>
          contextSetState({ nodeData: { ...nodeData, codeContent: value } })
        }
      />
    </div>
  );
}
