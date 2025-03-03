import { AdvancedMarker, Map, Pin } from '@vis.gl/react-google-maps';
import * as React from "react";
import { observer } from "mobx-react"
import { LocationStore } from '../../stores/LocationStore';
import CurrentPositionMarker from './CurrentPositionMarker';
import { locator } from '../../AppInitializer';
import { MapStore } from '../../stores/MapStore';
import { RouteRanditon } from './RouteRandition';

const MapWrapper = observer (() => {
  const locationStore = locator.get("LocationStore") as LocationStore;
  const mapStore = locator.get("MapStore") as MapStore;

  return (
      <Map
        mapId={process.env.REACT_APP_MAP_ID}
        style={{width: '100vw', height: '100vh'}}
        defaultCenter={{lat: locationStore.coordonates.latitude, lng: locationStore.coordonates.longitude}}
        defaultZoom={10}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        onClick={(e) => {console.log("map clicked", e); mapStore.onClick(e)}}
      >
        <CurrentPositionMarker />
        {
          mapStore.markers.map((marker, index) => {
            return (
              <AdvancedMarker
              position={marker.position}
              draggable={mapStore.draggable}
              onDrag={(e) => mapStore.onMarkerDrag(marker.id, e)}
              onDragEnd={(e) => mapStore.onMarkerDragEnd(marker.id, e)}
              >
                {
                  mapStore.draggable ? null : (
                    index === mapStore.markers.length - 1 ?
                    (
                      <Pin
                        background='black'
                        borderColor='black'
                        glyphColor='white'
                      />
                    ) :
                    (
                      <Pin
                        background='red'
                        borderColor='red'
                        glyphColor='white'
                      />
                    )
                  )
                }
                
              </AdvancedMarker>
            )
          })
        }
          <RouteRanditon />
      </Map>
)
});

export default MapWrapper;