import React, { Component } from "react";
import classNames from 'classnames';
import Lazy from "../Lazy";
import Virtual from "../Virtual";
import "./index.css";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      view: "virtual"
    };
  }

  switchView = view => {
    this.setState({
      view
    });
  };

  render() {
    const { view } = this.state;
    return (
      <div className="ChatPanel">
        <div className="tabs">
          <a
            href="#"
            onClick={() => {
              this.switchView("lazy");
            }}
          >
            Lazy
          </a>
          <a
            href="#"
            onClick={() => {
              this.switchView("virtual");
            }}
          >
            Virtual
          </a>
          <a
            href="#"
            onClick={() => {
              this.switchView("virtual");
            }}
          >
            Virtual With Loader
          </a>
        </div>
        <div>
          {view === "lazy" && <Lazy />}
          {view === "virtual" && <Virtual />}
        </div>
      </div>
    );
  }
}

export default App;
