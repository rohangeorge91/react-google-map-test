import React, { Component } from 'react';
import './App.css';
import Map from './component/Map';
import { defaultUrl } from './component/constant';

class App extends Component {
  constructor() {
    super();
    this.state = {
      resourceUrl: defaultUrl
    };
  }

  inputSubmitHandler(e) {
    e.preventDefault(e);
    const value = e.target.value;
    if (this.state.resourceUrl !== value) {
      this.setState({ resourceUrl: value });
    }
  }

  render() {
    return (
      <div className="App" style={{ height: '100vh', width: '100vw' }}>
        <div style={{heigth: '10%'}}>
          <input type="text" defaultValue={defaultUrl} onBlur={(e) => this.inputSubmitHandler(e)} style={{width: '100%'}} />
        </div>
        <div style={{height: '90%'}}>
          <Map resourceUrl={this.state.resourceUrl} />
        </div>
      </div>
    );
  }
}

export default App;
