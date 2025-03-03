import { observer } from 'mobx-react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import * as React from 'react';
import './CurrentPositionMarker.css';
import { LocationStore } from '../../stores/LocationStore';
import { locator } from '../../AppInitializer';


const CurrentPositionMarker = observer (() => {

    const locationStore = locator.get("LocationStore") as LocationStore;

    console.log("Rendering current position marker", locationStore.coordonates.latitude, locationStore.coordonates.longitude);

    const heading = locationStore.heading;
    const markerStyle = {
        transform: `rotate(${heading}deg)`
      };
    return (
        <AdvancedMarker
            position={{lat: locationStore.coordonates.latitude, lng: locationStore.coordonates.longitude}}
            >
            <div className="marker" style={markerStyle}>
                <div className="solid-circle"></div>
                <div className="fading-arc"></div>
            </div>

        </AdvancedMarker>
    );
});

export default CurrentPositionMarker;