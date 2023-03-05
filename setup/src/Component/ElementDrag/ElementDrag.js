import React, { useEffect, useReducer } from "react";
import { sortableContainer, sortableElement } from "react-sortable-hoc";
import "./ElementDrag.css";

import BackHome from "../BackHome/BackHome";

const rowStyle = {
  height: "100%",
  width: "100%",
};

const colStyle = {
  width: "24%",
  height: "50%",
  background: "#f2f2f2",
};

const renderList = () => <>111</>;

const isCostDomeList = [
  { type: 0, index: 0, dom: renderList },
  { type: 1, index: 1, dom: renderList },
  { type: 2, index: 2, dom: renderList },
  { type: 3, index: 3, dom: renderList },
  { type: 4, index: 4, dom: renderList },
  { type: 5, index: 5, dom: renderList },
  { type: 6, index: 6, dom: renderList },
  { type: 7, index: 7, dom: renderList },
];

const SortableContainer = sortableContainer(({ children }) => {
  return <div style={rowStyle}>{children}</div>;
});

const SortableItem = sortableElement(({ item, indexz }) => {
  return (
    <div
      className={`border-top ${
        (indexz + 1) % 4 === 0 ? "no-border-right" : ""
      }`}
      style={colStyle}
    >
      {item?.dom()}
    </div>
  );
});

export default function ElementDrag() {
  const [state, setState] = useReducer(
    (oldVal, newVal) => ({ ...oldVal, ...newVal }),
    {
      items: [],
    }
  );
  const { items } = state;

  useEffect(() => {
    setState({ items: isCostDomeList });
  }, []);

  const onSortEnd = ({ oldIndex, newIndex }) => {
    const newItems = items;
    const removeItem = newItems.splice(oldIndex, 1)[0];
    newItems.splice(newIndex, 0, removeItem);
    setState({ items: newItems });
  };

  return (
    <>
      <BackHome></BackHome>
      <div style={{ height: 500, padding: "0 40px" }} className="container">
        <SortableContainer axis={"xy"} onSortEnd={onSortEnd}>
          {items.map((item, index) => (
            <SortableItem
              key={item.type}
              index={index}
              item={item}
              indexz={index}
            />
          ))}
        </SortableContainer>
      </div>
    </>
  );
}
