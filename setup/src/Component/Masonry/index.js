import React, { useEffect, useRef } from "react";
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  createMasonryCellPositioner,
  Masonry,
} from "react-virtualized";

const list = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
];

const columnWidth = 400;
const defaultHeight = 250;
const defaultWidth = columnWidth;
const columnCount = 2;
const gutterSize = 10;

const cellMeasureCache = new CellMeasurerCache({
  defaultHeight,
  defaultWidth,
  fixedWidth: true,
});

const cellPositioner = createMasonryCellPositioner({
  cellMeasurerCache: cellMeasureCache,
  columnCount: columnCount,
  columnWidth,
  spacer: gutterSize,
});

const MasonryBox = () => {
  const masonryRef = useRef(null);
  const _width = useRef(0);
  const _columnCount = useRef(columnCount);
  const _itemWidth = useRef(defaultWidth);

  useEffect(() => {
    return () => {
      cellMeasureCache.clearAll();
    };
  }, []);

  const onResize = ({ width }) => {
    _width.current = width;
    calculateColumnCount();
    resetCellPositioner();
    if (masonryRef.current) {
      masonryRef.current.recomputeCellPositions();
    }
  };

  const calculateColumnCount = () => {
    const itemWidth = columnWidth + gutterSize;
    const bothWidth = _width.current / 2;
    const itemViewWidth = bothWidth < itemWidth ? itemWidth : bothWidth;
    _columnCount.current = Math.floor(_width.current / itemViewWidth);
    _itemWidth.current = bothWidth < itemWidth ? "100%" : `${bothWidth}px`;
  };

  const resetCellPositioner = () => {
    cellPositioner.reset({
      columnCount: _columnCount.current,
      columnWidth: _width.current / 2,
      spacer: gutterSize,
    });
  };

  const cellRenderer = ({ index, key, parent, style }) => {
    const datum = list[index];
    return (
      <CellMeasurer
        cache={cellMeasureCache}
        index={index}
        key={index}
        parent={parent}
      >
        <div style={{ ...style, width: _itemWidth.current }}>
          <div style={{ background: "pink", height: datum * 40 }}>{datum}</div>
        </div>
      </CellMeasurer>
    );
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AutoSizer onResize={onResize}>
        {({ width, height }) => {
          return (
            <Masonry
              height={height}
              width={width}
              cellCount={list.length}
              cellMeasurerCache={cellMeasureCache}
              cellRenderer={cellRenderer}
              cellPositioner={cellPositioner}
              ref={(ref) => (masonryRef.current = ref)}
            />
          );
        }}
      </AutoSizer>
    </div>
  );
};

export default MasonryBox;
