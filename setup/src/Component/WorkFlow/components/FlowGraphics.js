import React, { useEffect, useReducer, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  useEdgesState,
  useNodesState,
} from "reactflow";

import { RootNodes, OrdinaryNodes } from "./CustomNodes";

const nodeTypes = {
  rootNodes: RootNodes,
  ordinaryNodes: OrdinaryNodes,
};

export default function FlowGraphics() {
  const flowRef = useRef(null);
  const [forceUpdateData, forceUpdate] = useReducer((x) => x + 1, 0);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (flowRef.current) {
      setTimeout(() => {
        flowRef.current.fitView();
      }, 200);
    }
  }, [forceUpdateData]);

  const onInit = (reactFlowInstance) => {
    flowRef.current = reactFlowInstance;
  };

  return (
    <div style={{ flex: 1 }}>
      <ReactFlow
        fitView
        maxZoom={1}
        nodes={nodes}
        edges={edges}
        minZoom={0.2}
        onInit={onInit}
        nodeTypes={nodeTypes}
        selectionKeyCode={false}
        // onEdgeClick={onEdgeClick}
        // onPaneClick={onPaneClick}
        // onNodesChange={onNodesChange}
        // onEdgesChange={onEdgesChange}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#ccc" size={2} variant="dots" />
        <Controls showInteractive={false} position="top-right" />
      </ReactFlow>
    </div>
  );
}
