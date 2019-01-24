import React, { Component } from "react";
import classNames from 'classnames';
import Lazy from "../Lazy";
import Virtual from "../Virtual";
import VirtualPreload from "../VirtualPreload";
import "./index.css";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      view: "virtualPreload"
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
            className={view === "lazy" ? "selected" : ""}
            onClick={() => {
              this.switchView("lazy");
            }}
          >
            Lazy
          </a>
          <a
            href="#"
            className={view === "virtual" ? "selected" : ""}
            onClick={() => {
              this.switchView("virtual");
            }}
          >
            Virtual
          </a>
          <a
            href="#"
            className={view === "virtualPreload" ? "selected" : ""}
            onClick={() => {
              this.switchView("virtualPreload");
            }}
          >
            Virtual + Preload
          </a>
        </div>
        <div>
          {view === "lazy" && <Lazy />}
          {view === "virtual" && <Virtual />}
          {view === "virtualPreload" && <VirtualPreload />}
        </div>
      </div>
    );
  }
}

export default App;
