import React, { Component } from "react";
import classNames from "classnames";
import { generateLogItem } from "../../utils/mock";

const LOG_COUNT = 10000;

class Base extends Component {
  constructor(props) {
    super(props);

    const log = {};
    for (let i = 0; i < LOG_COUNT; i++) {
      log[i] = generateLogItem(i);
      if (i === LOG_COUNT - 1) {
        log[i] = generateLogItem(i, "image");
      }
    }

    this.state = {
      log,
      firstLoad: true,
      firstId: null,
      lastId: null
    };

    this.stickBottom = true;
    this.getChatLogRef = el => (this.chatLogRef = el);
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

  handleImageLoad = () => {
    if (this.stickBottom) {
      this.chatLogRef.scrollTop = 1e20;
    }
  };

  componentDidMount() {
    if (this.chatLogRef) {
      this.chatLogRef.scrollTop = 1e20;
    }
  }

  componentDidUpdate() {
    if (this.stickBottom) {
      if (this.chatLogRef) {
        this.chatLogRef.scrollTop = 1e20;
      }
    }
  }

  render() {
    if (this.state.firstLoad) {
      setTimeout(() => {
        this.setState({ firstLoad: false });
      });
      return null;
    }

    const { log } = this.state;
    const sortedLog = Object.keys(log).map(key => log[key]);
    sortedLog.sort((a, b) => a.ts - b.ts);

    console.log("render", log);

    return (
      <div className="ChatPanel">
        <div
          ref={this.getChatLogRef}
          className="ChatLog"
          onScroll={this.handleScroll}
        >
          {sortedLog.map(({ type, text, ts, src }) => {
            if (type === "text") {
              return (
                <div key={ts} className="Item">
                  {text}
                </div>
              );
            }
            return (
              <div
                key={ts}
                className={classNames("Item", {
                  LastItem: ts === Object.keys(this.state.log).length - 1
                })}
              >
                <img alt="img" src={src} onLoad={this.handleImageLoad} />
                <div className="Text">{text}</div>
              </div>
            );
          })}
        </div>
        <div className="Composer">
          <button onClick={this.addText}>Add Text Item</button>
          <button onClick={this.addImage}>Add Image Item</button>
        </div>
      </div>
    );
  }
}

export default Base;
