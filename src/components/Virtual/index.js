import * as React from "react";
import {
  CellMeasurer,
  CellMeasurerCache,
  List,
  AutoSizer
} from "react-virtualized";
import { generateLogItem } from "../../utils/mock";

const STICK_BOTTOM_THRESHOLD = 0;

function loadImg() {
  const p = new Promise();
  const img = document.createElement('img');
  img.onload = p.resolve(true);
  img.onerror = p.resolve(false);
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
    this.updateListRef = el => this.listRef = el;
    this.updateImgRef = (el, index) => this.imgRefs[index] = el;

    const log = {};

    for (let i = 0; i < 100; i++) {
      log[i] = generateLogItem(i);
    }

    this.state = { log, loading: true };
    this.firstScroll = true;

    window.onresize = this.handleResize;

    this.stickBottom = true;
  }

  handleResize = () => {
    console.log('handle resize');
    this._cache.clearAll();

    this.listRef.forceUpdateGrid();

    if (this.stickBottom) {
      this.listRef.scrollToRow(Object.keys(this.state.log).length - 1);
    }
  };

  handleImageLoad = (e, id) => {
    this.state.log[id].measured = true;
    this.state.log[id].width = this.imgRefs[id].clientWidth;
    this.state.log[id].height = this.imgRefs[id].clientHeight;
    console.log('image load', e, this.state.log[id].width, this.state.log[id].height);
  }

  handleScroll = ({ clientHeight, scrollHeight, scrollTop }) => {
    if (this.firstScroll) {
      this.firstScroll = false;
      return;
    }
    console.log('handle scroll', scrollHeight - (clientHeight + scrollTop));
    this.updateStickBottom({ clientHeight, scrollHeight, scrollTop });
  };

  updateStickBottom = ({ clientHeight, scrollHeight, scrollTop }) => {
    if (scrollHeight - (clientHeight + scrollTop) <= STICK_BOTTOM_THRESHOLD) {
      this.stickBottom = true;
    } else {
      this.stickBottom = false;
    }
    console.log('updated this.stickBottom', this.stickBottom);
  };

  render() {
    console.log('render stick bottom', this.stickBottom);
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
                scrollToIndex={this.stickBottom ? Object.keys(this.state.log).length - 1 : undefined}
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
    const { type, ts, text, src, measured, width, height } = this.state.log[index];

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
                <div style={{
                  width: measured ? width + 'px' : '',
                  height: measured ? height + 'px' : ''
                }}>
                  <img ref={(el) => { this.updateImgRef(el, index) }} src={src} onLoad={!measured ? (e) => {
                    this.handleImageLoad(e, index);
                    measure(e);
                  } : undefined} />
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
