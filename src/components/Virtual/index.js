import * as React from "react";
import classNames from "classnames";
import {
  CellMeasurer,
  CellMeasurerCache,
  List,
  AutoSizer
} from "react-virtualized";
import { generateLogItem } from "../../utils/mock";

const STICK_BOTTOM_THRESHOLD = 0;
const LOG_COUNT = 10000;

export default class Virtual extends React.Component {
  constructor(props, context) {
    super(props, context);

    this._cache = new CellMeasurerCache({
      fixedWidth: true
    });
    this._imgCache = {};

    this.imgRefs = {};

    this._rowRenderer = this._rowRenderer.bind(this);
    this.updateListRef = el => (this.listRef = el);
    this.updateImgRef = (el, index) => (this.imgRefs[index] = el);

    const log = {};

    for (let i = 0; i < LOG_COUNT; i++) {
      log[i] = generateLogItem(i);
      if (i === LOG_COUNT - 1) {
        log[i] = generateLogItem(i, "image");
      }
    }

    this.state = { log, length: LOG_COUNT, lastId: LOG_COUNT - 1 };
    this.firstScroll = true;

    window.onresize = this.handleResize;

    this.stickBottom = true;
  }

  addText = () => {
    const { log, lastId } = this.state;
    this.setState({
      log: {
        ...log,
        [lastId + 1]: generateLogItem(lastId + 1, "text")
      },
      lastId: lastId + 1
    });
  };

  addImage = () => {
    const { log, lastId } = this.state;
    this.setState({
      log: {
        ...log,
        [lastId + 1]: generateLogItem(lastId + 1, "image")
      },
      lastId: lastId + 1
    });
  };

  handleResize = id => {
    console.log("handle resize");

    setTimeout(() => {
      this._cache.clearAll();
      this.listRef && this.listRef.forceUpdateGrid();

      if (this.stickBottom) {
        this.listRef && this.listRef.scrollToRow(this.state.length - 1);
      }
    });
  };

  handleImageLoad = (e, id) => {
    this._imgCache[id] = {
      width: this.imgRefs[id].clientWidth,
      height: this.imgRefs[id].clientHeight
    };

    setTimeout(() => {
      this._cache.clearAll();
      this.listRef && this.listRef.forceUpdateGrid();

      if (this.stickBottom) {
        this.listRef && this.listRef.scrollToRow(this.state.length - 1);
      }
    });
  };

  handleScroll = ({ clientHeight, scrollHeight, scrollTop }) => {
    if (this.firstScroll) {
      this.firstScroll = false;
      return;
    }
    console.log("handle scroll", scrollHeight - (clientHeight + scrollTop));
    this.updateStickBottom({ clientHeight, scrollHeight, scrollTop });
  };

  updateStickBottom = ({ clientHeight, scrollHeight, scrollTop }) => {
    if (scrollHeight - (clientHeight + scrollTop) <= STICK_BOTTOM_THRESHOLD) {
      this.stickBottom = true;
    } else {
      this.stickBottom = false;
    }
    console.log("updated this.stickBottom", this.stickBottom);
  };

  render() {
    console.log("render stick bottom", this.stickBottom);
    return (
      <div className="ChatPanel">
        <div className="ChatLog">
          <AutoSizer>
            {({ width, height }) => (
              <List
                ref={this.updateListRef}
                deferredMeasurementCache={this._cache}
                width={width}
                height={height}
                overscanRowCount={0}
                rowCount={this.state.length}
                rowHeight={this._cache.rowHeight}
                rowRenderer={this._rowRenderer}
                scrollToIndex={
                  this.stickBottom ? this.state.length - 1 : undefined
                }
                onScroll={this.handleScroll}
              />
            )}
          </AutoSizer>
        </div>
        <div className="Composer">
          <button onClick={this.addText}>Add Text Item</button>
          <button onClick={this.addImage}>Add Image Item</button>
        </div>
      </div>
    );
  }

  _rowRenderer({ index, key, parent, style }) {
    const { type, ts, text, src } = this.state.log[index];
    const measured = this._imgCache[index] ? true : false;
    const imgSize = this._imgCache[index] || {};
    const { imgWidth, imgHeight } = imgSize;

    return (
      <CellMeasurer
        cache={this._cache}
        columnIndex={0}
        key={key}
        rowIndex={index}
        parent={parent}
      >
        {({ measure }) => (
          <div style={style}>
            {type === "text" && (
              <div
                key={ts}
                className={classNames("Item", {
                  LastItem: index === this.state.length - 1
                })}
              >
                {text}
              </div>
            )}
            {type === "image" && (
              <div
                key={ts}
                className={classNames("Item ImageItem", {
                  LastItem: index === this.state.length - 1
                })}
              >
                <div
                  style={{
                    width: measured ? imgWidth + "px" : "",
                    height: measured ? imgHeight + 2 + "px" : ""
                  }}
                >
                  <img
                    ref={el => {
                      this.updateImgRef(el, index);
                    }}
                    alt="img"
                    src={src}
                    onLoad={
                      !measured
                        ? e => {
                            measure(e);
                            this.handleImageLoad(e, index);
                          }
                        : undefined
                    }
                  />
                </div>
                <div className="Text">{text}</div>
              </div>
            )}
          </div>
        )}
      </CellMeasurer>
    );
  }
}
