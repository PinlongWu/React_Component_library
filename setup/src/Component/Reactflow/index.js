import React, { useEffect, useReducer } from "react";
import * as R from "ramda";
import dagre from "dagre";
import ReactFlow, {
  Background,
  Panel,
  Controls,
  MarkerType,
  useNodesState,
  useEdgesState,
  ConnectionMode,
} from "reactflow";
import "reactflow/dist/style.css";

import CustomNode from "./CustomNode";
import SimpleFloatingEdge from "./SimpleFloatingEdge";

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  floating: SimpleFloatingEdge,
};

const data = [
  { name: "A", children: [{ name: "C" }, { name: "B" }] },
  { name: "A", children: [{ name: "C" }, { name: "D" }, { name: "F" }] },
  { name: "A", children: [{ name: "C" }, { name: "D" }, { name: "E" }] },
  { name: "A", children: [{ name: "H" }, { name: "I" }, { name: "G" }] },
];

const nodeWidth = 180;
const nodeHeight = 40;
const ranksep = 200;

export default function Reactflow() {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const getLayoutedElements = (nodes, edges, direction = "TB") => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    const isHorizontal = direction === "LR";
    dagreGraph.setGraph({ rankdir: direction, ranksep, nodesep: 80 });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });
    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.targetPosition = isHorizontal ? "left" : "top";
      node.sourcePosition = isHorizontal ? "right" : "bottom";

      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      };

      return node;
    });

    return { nodes, edges };
  };

  // 获取每个节点的等级, 以及等级下有哪些节点, 以及当前节点有哪些下一级节点，以及整体哪些整体流程
  const getNodes = (item, _item, _index, mergeNodesLevel) => {
    const { data, alreadyExists } = mergeNodesLevel;
    const level = _index + 1;

    const { children } = item;
    const { name } = _item;
    const nextNode = children[_index + 1];
    const nextNodesFlagData = nextNode ? [nextNode] : [];
    const nextAlreadyExistsFlagData = nextNode ? [nextNode.name] : [];

    if (!R.has(level, data)) {
      data[level] = {};
      data[level][name] = {
        own: _item,
        nextNodes: nextNodesFlagData,
        nextAlreadyExists: [...nextAlreadyExistsFlagData],
        overallProcess: [item],
      };
    } else {
      if (!R.includes(name, alreadyExists)) {
        data[level][name] = {
          own: _item,
          nextNodes: nextNodesFlagData,
          nextAlreadyExists: [...nextAlreadyExistsFlagData],
          overallProcess: [item],
        };
      } else {
        if (
          nextNode &&
          !R.includes(nextNode.name, data[level][name].nextAlreadyExists)
        ) {
          data[level][name].nextNodes = [
            ...data[level][name].nextNodes,
            ...nextNodesFlagData,
          ];
          data[level][name].nextAlreadyExists = [
            ...data[level][name].nextAlreadyExists,
            ...nextAlreadyExistsFlagData,
          ];
        }
        data[level][name].overallProcess = [
          ...data[level][name].overallProcess,
          item,
        ];
      }
    }
    alreadyExists.push(name);
  };

  // 处理 edges
  const getEdges = (item, _item, _index, mergeReges) => {
    const { data, alreadyExists } = mergeReges;
    const { children, ...rest } = item;
    const source = _item;
    const target = children[_index + 1] || rest;
    const id = `${source.name}-${target.name}`;

    if (!R.includes(id, alreadyExists)) {
      data[id] = {
        id,
        data: { overallProcess: [item], own: { source, target } },
        source: source.name,
        target: target.name,
        style: { strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed },
      };
    } else {
      data[id].data.overallProcess = [...data[id].data.overallProcess, item];
    }

    alreadyExists.push(id);
  };

  const getNodesAndEdges = (data) => {
    const { children, ...rest } = data[0] || {};
    const lastTargetNode = {
      id: rest.name,
      data: { label: rest.name, ...rest },
    };

    let nodes = [];
    let edges = [];
    let mergeNodesLevel = { data: {}, alreadyExists: [] }; // alreadyExists表示以及出现的数据
    let mergeReges = { data: {}, alreadyExists: [] }; // alreadyExists表示以及出现的数据
    R.forEach((item) => {
      const { children } = item;
      R.addIndex(R.forEach)((_item, _index) => {
        getNodes(item, _item, _index, mergeNodesLevel);
        getEdges(item, _item, _index, mergeReges);
      }, children || []);
    }, data || []);
    mergeNodesLevel = mergeNodesLevel.data;

    R.forEachObjIndexed((item, index) => {
      R.forEach((_item) => {
        const { own } = _item;
        const { name } = own;
        nodes.push({
          id: name,
          data: { label: name, ..._item },
        });
      }, R.values(item || {}));
    }, mergeNodesLevel || []);
    nodes = [...nodes, lastTargetNode];
    edges = R.values(mergeReges.data || {});

    console.log(nodes, edges, mergeNodesLevel, "nodes, edges, mergeNodesLevel");
    return { nodes, edges };
  };

  useEffect(() => {
    const { nodes, edges } = getNodesAndEdges(data);
    const { nodes: n, edges: e } = getLayoutedElements(nodes, edges);
    setNodes(n);
    setEdges(e);
    forceUpdate();
  }, []);

  return (
    <div style={{ height: "100%", display: "flex" }}>
      <div style={{ flex: 1 }}>
        <ReactFlow
          fitView
          nodes={nodes}
          edges={edges}
          minZoom={0.2}
          // nodeTypes={nodeTypes}
          // edgeTypes={edgeTypes}
          nodesFocusable={false}
          nodesDraggable={false}
          selectionKeyCode={false}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          proOptions={{ hideAttribution: true }}
          connectionMode={ConnectionMode.Loose}
          onEdgeClick={(event, edge) => console.log(event, edge)}
          onNodeClick={(event, node) => console.log(event, node)}
        >
          <Background />
          <Panel position="top-left">top-left</Panel>
          <Controls showInteractive={false} position="top-right" />
        </ReactFlow>
      </div>
    </div>
  );
}
