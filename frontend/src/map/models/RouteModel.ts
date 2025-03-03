import { MapModel } from "./MapModel";

export interface RouteModel {
    routeId: string
    waypoints: google.maps.LatLngLiteral[];
    name: string;
}

export class RouteModelFactory {

    static createFromMapModel(mapModel:MapModel, name: string, id?: string): RouteModel {
        return { routeId: id ?? "invalid", waypoints: mapModel.markers.map(m => m.position), name: name };
    }
}