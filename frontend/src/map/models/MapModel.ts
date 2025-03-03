import { MapController } from "../controllers/MapController";
import { MarkerModel, MarkerModelFactory } from "./MarkerModel";

export interface MapModel {
    markers: MarkerModel[];
    showUserLocation: boolean;
    routeResult: google.maps.DirectionsResult | undefined;
    controller: MapController;
}


export class MapModelFactory {
    static createEmpty(): MapModel {
        return {
            markers: [],
            showUserLocation: false,
            routeResult: undefined,
            controller: new MapController()
        }
    }

    static createFromWaypoints(waypoints: google.maps.LatLngLiteral[]): MapModel {
        const markers = waypoints.map(p => MarkerModelFactory.createFromPoint(p));
        const mapModel = MapModelFactory.createEmpty();
        mapModel.markers = markers;
        return mapModel;
    }
}