import React, { Component } from "react";
import lorem from "./lorem";
import "./App.css";

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
      Math.floor(Math.random() * 200)}/${500 + Math.floor(Math.random()) * 1000}`,
    text: id + "." + randomText()
  };
}

function loadImg() {
  const p = new Promise((resolve, reject) => {

  });
  const img = document.createElement('img');
  img.onload = p.resolve(true);
  img.onerror = p.resolve(false);
  return p;
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      log: {},
      firstId: null,
      lastId: null
      // firstId: LAST_ID - INITIAL_COUNT + 1,
      // lastId: LAST_ID
    };

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
    console.log('handle scroll', this.chatLogRef.scrollTop);
    if (this.chatLogRef.scrollTop < 20) {
      this.chatLogRef.scrollTop = 20;
      return;
    }

    if (this.chatLogRef.scrollTop + this.chatLogRef.clientHeight < this.chatLogRef.scrollHeight) {
      this.stickBottom = false;
    }
    else {
      this.stickBottom = true;
    }

    if (this.stickBottom || this.state.loading) return;

    this.prependChunk();
  };

  handleImageLoad = () => {
    if (this.stickBottom) {
      this.chatLogRef.scrollTop = 1e20;
    }
  };

  prependChunk() {
    let { log, firstId, lastId } = this.state;
    let chunkSize = CHUNK_SIZE;

    if (firstId === null) {
      firstId = LAST_ID + 1;
      lastId = LAST_ID;

      this.setState({
        lastId: LAST_ID
      });

      chunkSize = INITIAL_COUNT;
    }

    if (firstId > 0 && this.chatLogRef && this.chatLogRef.scrollTop <= 200) {
      const nextFirstId = Math.max(firstId - chunkSize, 0);
      const addedLog = {};

      this.setState({ loading: true });

      setTimeout(() => {
        for (let i = firstId - 1; i >= nextFirstId; i--) {
          addedLog[i] = generateLogItem(i);
          // if (addedLog[i].type === 'image') {
          //   promises.push(loadImg(addedLog[i]));
          // }
        }

        this.setState({
          log: {
            ...log,
            ...addedLog
          },
          firstId: nextFirstId,
          loading: false
        });
        console.log('set loading', false);
      }, 500);

      // start loading images

      // this.setState({
      //   log: {
      //     ...log,
      //     ...addedLog
      //   },
      //   firstId: nextFirstId
      // });
    }
  }

  componentDidMount() {
    const log = {};

    console.log('did mount');

    this.prependChunk();

    this.chatLogRef.scrollTop = 1e20;
  }

  componentDidUpdate() {
    if (this.stickBottom) {
      this.chatLogRef.scrollTop = 1e20;
    }
  }

  render() {
    const { log, loading } = this.state;
    const sortedLog = Object.keys(log).map(key => log[key]);
    sortedLog.sort((a, b) => a.ts - b.ts);

    console.log('render', loading);

    return (
      <div className="ChatPanel">
        {/*<button onClick={this.resizeChatPanel} />*/}
        <div ref={this.getChatLogRef} className="ChatLog" onScroll={this.handleScroll}>
          {/*<div>
            <h1>loading...</h1>
          </div>*/}
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
