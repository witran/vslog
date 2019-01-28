import React, { Component } from "react";
import Base from "../Base";
import Lazy from "../Lazy";
import Virtual from "../Virtual";
import VirtualPreload from "../VirtualPreload";
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
            className={view === "base" ? "selected" : ""}
            onClick={() => {
              this.switchView("base");
            }}
          >
            Base
          </a>
          {/*<a
            href="#"
            className={view === "lazy" ? "selected" : ""}
            onClick={() => {
              this.switchView("lazy");
            }}
          >
            Lazy
          </a>*/}
          <a
            href="#"
            className={view === "virtual" ? "selected" : ""}
            onClick={() => {
              this.switchView("virtual");
            }}
          >
            Virtual
          </a>
          {/*<a
            href="#"
            className={view === "virtualPreload" ? "selected" : ""}
            onClick={() => {
              this.switchView("virtualPreload");
            }}
          >
            Virtual + Preload Images
          </a>*/}
        </div>
        <div>
          {view === "base" && <Base />}
          {view === "lazy" && <Lazy />}
          {view === "virtual" && <Virtual />}
          {view === "virtualPreload" && <VirtualPreload />}
        </div>
      </div>
    );
  }
}

export default App;
