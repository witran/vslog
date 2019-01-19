import React, { Component } from "react";
import lorem from "./lorem";
import "./App.css";

console.log(lorem);

const INITIAL_COUNT = 20;
const LAST_ID = 100;
const CHUNK_SIZE = 5;

function randomText() {
  const len = 40 + Math.floor(Math.random() * 120);
  const start = Math.floor(Math.random() * (lorem.length - len));
  return lorem.slice(start, start + len);
}

function generateLogItem(id, _type) {
  const type = _type ? _type : Math.random() > 0.5 ? "text" : "image";

  if (type === "text") {
    return {
      ts: id,
      type,
      text: id + "." + randomText()
    };
  }
  return {
    ts: id,
    type,
    src: `/${100 + Math.floor(Math.random() * 200)}x${100 +
      Math.floor(Math.random() * 200)}`,
    text: id + "." + randomText()
  };
}

class App extends Component {
  constructor(props) {
    super(props);

    const log = {};

    for (let i = LAST_ID; i > LAST_ID - INITIAL_COUNT; i--) {
      log[i] = generateLogItem(i);
    }

    this.state = {
      log,
      firstId: LAST_ID - INITIAL_COUNT + 1,
      lastId: LAST_ID
    };

    const first = {};

    this.stickBottom = true;
    this.getChatLogRef = el => this.chatLogRef = el;
  }

  addText = () => {
    const { log, lastId } = this.state;
    this.setState({
      log: {
        ...this.state.log,
        [lastId + 1]: generateLogItem(lastId + 1, 'text')
      },
      lastId: lastId + 1
    });
  };

  addImage = () => {
    const { log, lastId } = this.state;
    this.setState({
      log: {
        ...log,
        [lastId + 1]: generateLogItem(lastId + 1, 'image')
      },
      lastId: lastId + 1
    });
  };

  handleScroll = () => {
    console.log(this.chatLogRef.scrollTop, this.chatLogRef.clientHeight, this.chatLogRef.scrollHeight);

    if (this.chatLogRef.scrollTop + this.chatLogRef.clientHeight < this.chatLogRef.scrollHeight) {
      this.stickBottom = false;
    }
    else {
      this.stickBottom = true;
    }
    // if (this.chatLogRef.scrollTop + this.chatLogRef.clientHeight)
    if (this.stickBottom) return;
    console.log('handle scroll');
    const { log, firstId } = this.state;
    const nextFirstId = Math.max(firstId - CHUNK_SIZE, 0);
    const addedLog = {};
    if (firstId > 0 && this.chatLogRef && this.chatLogRef.scrollTop <= 200) {
      for (let i = firstId - 1; i >= nextFirstId; i--) {
        addedLog[i] = generateLogItem(i);
      }
      this.setState({
        log: {
          ...log,
          ...addedLog
        },
        firstId: nextFirstId
      })
    }
  };

  componentDidMount() {
    if (this.stickBottom) {
      this.chatLogRef.scrollTop = 1e20;
    }
  }

  componentDidUpdate() {
    if (this.stickBottom) {
      this.chatLogRef.scrollTop = 1e20;
    }
  }

  handleImageLoad = () => {
    if (this.stickBottom) {
      this.chatLogRef.scrollTop = 1e20;
    }
  };

  scrollToBottom() {

  }

  render() {
    const { log } = this.state;
    const sortedLog = Object.keys(log).map(key => log[key]);
    sortedLog.sort((a, b) => a.ts - b.ts);

    return (
      <div className="ChatPanel">
        <button onClick={this.resizeChatPanel} />
        <div ref={this.getChatLogRef} className="ChatLog" onScroll={this.handleScroll}>
          {sortedLog.map(({ type, text, ts, src }) => {
            if (type === "text") {
              return <div key={ts} className="Item">{text}</div>;
            }
            return (
              <div key={ts} className="Item">
                <img src={src} onLoad={this.handleImageLoad}/>
                <div>{text}</div>
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

export default App;
