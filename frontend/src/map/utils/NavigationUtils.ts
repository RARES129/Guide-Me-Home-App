import { LocationStore } from "../../stores/LocationStore";
import { DistanceUtils, Point } from "./DistanceUtils";

const MAX_DISTANCE_FROM_ROUTE = 100;

export class NavigationUtils {

    constructor(
        private readonly _distanceUtils: DistanceUtils,
        private readonly _locationStore: LocationStore
    ) {}

    public isCloseToRoute(routeResult: google.maps.DirectionsResult, epsilon = MAX_DISTANCE_FROM_ROUTE): boolean {
        const currentPoint: Point = {
            lat: this._locationStore.coordonates.latitude,
            lng: this._locationStore.coordonates.longitude
        }
        if (!routeResult) {
            console.error("No route result is active. You should not navigate without a route set.");
            return false;
        }
        const distance = this._distanceUtils.distanceFromPath(currentPoint, this._distanceUtils.resultToPath(routeResult));
        
        return distance < epsilon;
    }


}