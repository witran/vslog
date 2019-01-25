import * as React from "react";
import {
  CellMeasurer,
  CellMeasurerCache,
  List,
  AutoSizer
} from "react-virtualized";
import { generateLogItem } from "../../utils/mock";

const STICK_BOTTOM_THRESHOLD = 0;
const LOG_COUNT = 100;

function loadImg(src, id) {
  const p = new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.style.visibility = "hidden";
    img.style.position = "absolute";
    img.style.zIndex = -1;
    document.body.appendChild(img);
    img.onload = () => {
      resolve({ id, width: img.clientWidth, height: img.clientHeight });
    };
    img.onerror = () => {
      resolve({});
    };
    img.src = src;
  });
  return p;
}

export default class Virtual extends React.PureComponent {
  constructor(props, context) {
    super(props, context);

    this._rowRenderer = this._rowRenderer.bind(this);
    window.onresize = this.handleResize;

    this.imgRefs = {};
    this.updateListRef = el => (this.listRef = el);
    this.updateImgRef = (el, index) => (this.imgRefs[index] = el);
    this.unmeasuredLog = {};

    this.log = {};
    for (let i = 0; i < LOG_COUNT; i++) {
      this.log[i] = generateLogItem(i);
    }
    this.lastMeasuredLog = LOG_COUNT;
    this._cache = new CellMeasurerCache({
      fixedWidth: false,
      minHeight: 50
    });
    this.state = { log: {} };
    this.firstScroll = true;
    this.stickBottom = true;
    this.measureAndTransferLog();
  }

  measureAndTransferLog = () => {
    if (this.lastMeasuredLog === 0) return;
    const promises = [];
    const nextLastMeasuredLog = Math.max(this.lastMeasuredLog - 20, 0);

    console.log(nextLastMeasuredLog, this.lastMeasuredLog);

    const newLog = {};
    for (let i = this.lastMeasuredLog - 1; i >= nextLastMeasuredLog; i--) {
      newLog[i] = this.log[i];
      if (this.log[i].type === "image") {
        promises.push(loadImg(this.log[i].src, i));
      }
    }

    console.log("m & t", JSON.stringify(newLog, null, 2));

    Promise.all(promises).then(data => {
      data.forEach(({ id, width, height }) => {
        newLog[id].width = width;
        newLog[id].height = height;
      });

      this.lastMeasuredLog = nextLastMeasuredLog;
      this._cache.clearAll();
      this.setState({
        log: {
          ...this.state.log,
          ...newLog
        },
      });
      this.listRef && this.listRef.forceUpdateGrid();
      this.measureAndTransferLog();
    });
  };

  handleResize = () => {
    console.log("handle resize");

    this._cache.clearAll();

    setTimeout(() => {
      this.listRef && this.listRef.forceUpdateGrid();

      if (this.stickBottom) {
        this.listRef.scrollToRow(Object.keys(this.state.log).length - 1);
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
    {/*if (this.state.loading) return <div>Loading...</div>;*/}

    console.log("render() stick bottom", this.stickBottom);

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
                rowCount={Object.keys(this.state.log).length}
                rowHeight={this._cache.rowHeight}
                rowRenderer={this._rowRenderer}
                scrollToIndex={
                  this.stickBottom
                    ? Object.keys(this.state.log).length - 1
                    : undefined
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

  _rowRenderer = ({ index, key, parent, style }) => {
    const item = this.state.log[index];

    if (!item) return null;

    const { type, ts, text, src, width, height } = this.state.log[
      index + this.lastMeasuredLog
      // index
    ];

    return (
      <CellMeasurer
        cache={this._cache}
        columnIndex={0}
        key={ts}
        rowIndex={index}
        parent={parent}
      >
        {({ measure }) => (
          <div style={style}>
            {type === "text" && (
              <div key={ts} className="Item">
                {text}
              </div>
            )}
            {type === "image" && (
              <div key={ts} className="Item ImageItem">
                <div
                  style={{
                    width: width + "px",
                    height: height + "px"
                  }}
                >
                  <img
                    ref={el => {
                      this.updateImgRef(el, index);
                    }}
                    src={src}
                  />
                </div>
                <div className="Text">{text}</div>
              </div>
            )}
          </div>
        )}
      </CellMeasurer>
    );
  };
}
