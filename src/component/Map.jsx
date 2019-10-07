import React, { Component } from 'react';
import {
  withScriptjs,
  GoogleMap,
  Polyline,
  withGoogleMap
} from 'react-google-maps';
import pako from 'pako';
import { sendAPIRequest, getObject } from './network';
import { googleMapUrl } from './constant';

const uncompressData = (URL) => {
  const options = getObject();
  return sendAPIRequest(URL, options).then((data) => {
    return data.arrayBuffer();
  }).then((data) => {
    const unzip = pako.ungzip(data, {to: 'string'});
    return unzip;
  }).then((data) => {
    return JSON.parse(data);
  }).catch((err) => {
    console.error(err);
    throw err;
  });
};

class Map extends Component {
  constructor() {
    super();
    this.state = {
      data: []
    };
  }

  componentDidMount() {
    uncompressData(this.props.resourceUrl).then((data) => {
      this.setState({ data }); 
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.resourceUrl !== prevProps.resourceUrl) {
      uncompressData(this.props.resourceUrl).then((data) => {
        this.setState({ data });
      });
    }
  }

  render() {
    const drawPath = this.state.data.map((datum) => {
      return {
        lat: datum[1],
        lng: datum[2]
      };
    });  
    return (
      <GoogleMap
        defaultZoom={8}
        defaultCenter={{ lat: 35.3421516418457, lng: 139.201110839844 }} >
        <Polyline options={{
        path: drawPath,
        icons: [{
          icon: ">",
          offset: '0',
          repeat: '10px'
        }],
        fillColor: 'yellow',
        fillOpacity: 0.8,
        scale: 1,
        strokeColor: 'red',
        strokeWeight: 3
      }} />
      </GoogleMap>
    );

  }
}

const MapWithScript = withScriptjs(withGoogleMap((props) => {
  return <Map {...props} />;
}));

export default (props) => {
  return (
    <MapWithScript
      googleMapURL={googleMapUrl}
      loadingElement={<div style={{ height: '100%' }} />}
      containerElement={<div style={{ height: '100%' }} />}
      mapElement={<div style={{ height: '100%' }} />}
      {...props}
    />
  );
};