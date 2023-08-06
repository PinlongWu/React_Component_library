import { MarkerType } from "reactflow";

const nodeStyle = {
  color: "#0041d0",
  borderColor: "#0041d0",
};

export const initialNodes = [
  {
    id: "C",
    label: "C",
    position: { x: 100, y: 0 },
    data: { label: "C" },
    type: "input",
    style: nodeStyle,
  },
  {
    id: "H",
    label: "H",
    position: { x: -100, y: 0 },
    data: { label: "H" },
    type: "input",
    style: nodeStyle,
  },
  {
    id: "B",
    label: "B",
    position: { x: -200, y: 150 },
    data: { label: "B" },
    style: nodeStyle,
  },
  {
    id: "D",
    label: "D",
    position: { x: 0, y: 150 },
    data: { label: "D" },
    style: nodeStyle,
  },
  {
    id: "G",
    label: "G",
    position: { x: 200, y: 150 },
    data: { label: "G" },
    style: nodeStyle,
  },
  {
    id: "E",
    label: "E",
    position: { x: -100, y: 300 },
    data: { label: "E" },
    style: nodeStyle,
  },
  {
    id: "F",
    label: "F",
    position: { x: -100, y: 450 },
    data: { label: "F" },
    style: nodeStyle,
  },
  {
    id: "I",
    label: "I",
    position: { x: -100, y: 650 },
    data: { label: "I" },
    style: nodeStyle,
  },
  {
    id: "A",
    label: "A",
    position: { x: 0, y: 850 },
    data: { label: "A" },
    style: nodeStyle,
  },
];

export const initialEdges = [
  {
    id: "1->2",
    source: "1",
    target: "2",
    style: { stroke: "red" },
    type: "floating",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "red",
    },
  },
  {
    id: "1->2-1",
    source: "1",
    target: "2",
    sourceHandle: "b",
    // targetHandle: "b",
    style: { stroke: "red" },
    type: "floating",
  },
  {
    id: "1->3",
    source: "1",
    target: "3",
    style: { stroke: "red" },
    type: "floating",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "red",
    },
  },
  {
    id: "2->4",
    source: "2",
    target: "4",
    style: { stroke: "red" },
    type: "floating",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "red",
    },
  },
  {
    id: "2->5",
    source: "2",
    target: "5",
    style: { stroke: "red" },
    type: "floating",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "red",
    },
  },
  {
    id: "3->6",
    source: "3",
    target: "6",
    style: { stroke: "red" },
    type: "floating",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "red",
    },
  },
  {
    id: "4->6",
    source: "4",
    target: "6",
    style: { stroke: "red" },
    type: "floating",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "red",
    },
  },
  {
    id: "5->6",
    source: "5",
    target: "6",
    style: { stroke: "red" },
    type: "floating",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "red",
    },
  },
];
