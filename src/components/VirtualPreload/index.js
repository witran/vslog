import * as React from "react";
import {
  CellMeasurer,
  CellMeasurerCache,
  List,
  AutoSizer
} from "react-virtualized";
import { generateLogItem } from "../../utils/mock";

const STICK_BOTTOM_THRESHOLD = 0;

function loadImg(src, id) {
  const p = new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.style.visibility = "hidden";
    img.style.position = "absolute";
    img.style.zIndex = -1;
    document.body.appendChild(img);
    img.onload = () => {
      console.log(img);
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

    this._cache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 50
    });

    this.imgRefs = {};

    this._rowRenderer = this._rowRenderer.bind(this);
    this.updateListRef = el => (this.listRef = el);
    this.updateImgRef = (el, index) => (this.imgRefs[index] = el);

    const log = {};
    this.promises = [];

    for (let i = 0; i < 100; i++) {
      log[i] = generateLogItem(i);
    }

    for (let i = 99; i >= 0; i--) {
      if (log[i].type === "image") {
        promises.push(loadImg(log[i].src, i));
      }
    }

    this.startBackgroundImageLoading();

    Promise.all(promises).then(data => {
      data.forEach(({ id, width, height }) => {
        console.log(id, width, height);
        log[id].width = width;
        log[id].height = height;
      });
      this._cache.clearAll();
      this.setState({ loading: false });
      this.listRef && this.listRef.forceUpdateGrid();
    });

    this.state = { log, loading: true };
    this.firstScroll = true;

    window.onresize = this.handleResize;

    this.stickBottom = true;
  }

  handleImageLoaded = (firstId, lastId) => {
    // prepend log

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
    if (this.state.loading) return <div>Loading...</div>;
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
                rowCount={100}
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

  _rowRenderer({ index, key, parent, style }) {
    const { type, ts, text, src, width, height } = this.state.log[
      index
    ];

    if (this.state.loading && )

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
  }
}
