import { Position } from "@capacitor/geolocation";
import { LocationObserver, LocationService } from "../../services/LocationService";
import { NavigationUtils } from "./NavigationUtils";
import { RouteService } from "../../services/RouteService";
import { DistanceUtils } from "./DistanceUtils";
import { MapStore } from "../../stores/MapStore";
import { MapModel } from "../models/MapModel";
import { MarkerModelFactory } from "../models/MarkerModel";
import { MapController } from "../controllers/MapController";
import { RouteModel } from "../models/RouteModel";

const LOST_DISTANCE = 200;
const BACK_DISTANCE = 50;

enum NavigationState {
    LOST,
    ON_TRACK
}

export class NavigationContext implements LocationObserver {
    private _currentLocation?: Position;
    private _routeModel?: google.maps.DirectionsResult;
    private _mapModel?: MapModel;
    private _currentRouteResult?: google.maps.DirectionsResult;
    private _routeResultOverride?: google.maps.DirectionsResult;
    private _ongoingNavigation = false;
    private _navigationState: NavigationState = NavigationState.ON_TRACK;

    
    constructor(
        private readonly _locationService: LocationService,
        private readonly _distanceUtils: DistanceUtils,
        private readonly _navigationUtils: NavigationUtils,
        private readonly _routeService: RouteService,
        private readonly _mapStore: MapStore

    ) { 
        this._locationService.registerObserver(this);
    }        
    
    onLocationChanged(position: Position): void {
        this._currentLocation = position;

        if (!this._ongoingNavigation) {
           return;
        }
        this._checkIfCloseToRoute();
    }

    public startNavigation(routeResult: google.maps.DirectionsResult, routeModel: RouteModel): void {
        this.stopNavigation();
        this._routeModel = routeResult;
        this._currentRouteResult = routeResult;
        this._ongoingNavigation = true;
    }

    public stopNavigation(): void {
        this._currentRouteResult = undefined;
        if (this._mapModel) {
            this._mapStore.setCurrentMapModel(this._mapModel)
        }
        this._ongoingNavigation = false;
        this._navigationState = NavigationState.ON_TRACK;
        this._routeResultOverride = undefined;
        this._routeModel = undefined;
        this._mapModel = undefined;
    }

    private _checkIfCloseToRoute(): void {
        if(!this._currentLocation) {
            console.error("location should be available");
        }

        switch(this._navigationState) {
            case NavigationState.LOST:
                if (this._navigationUtils.isCloseToRoute(this._currentRouteResult, BACK_DISTANCE)) {
                    this._navigationState = NavigationState.ON_TRACK;
                    this._backOnTrack();
                }
                break;
            case NavigationState.ON_TRACK:
                if (!this._navigationUtils.isCloseToRoute(this._currentRouteResult, LOST_DISTANCE)) {
                    this._navigationState = NavigationState.LOST;
                    this._redirectToRoute();
                }
                break;
        }
    }

    private _redirectToRoute(): void {
        console.log("You are lost, rerouting");
        const currentLocationPoint: google.maps.LatLngLiteral = {
            lat: this._currentLocation!.coords.latitude,
            lng: this._currentLocation!.coords.longitude
        }
        const closestPoint = this._distanceUtils.closestPointOnPath(currentLocationPoint, this._distanceUtils.resultToPath(this._routeModel));
        this._mapModel = this._mapStore.currentMapModel;

        this._routeService.getRoute(currentLocationPoint, closestPoint, []).then((result) => {
            this._routeResultOverride = result;
            const newMapModel: MapModel = {
                markers: [MarkerModelFactory.createFromPoint(currentLocationPoint), MarkerModelFactory.createFromPoint(closestPoint)],
                showUserLocation: true,
                routeResult: result,
                controller: new MapController()
            }
            this._mapStore.setCurrentMapModel(newMapModel);
        });
    }

    private _backOnTrack(): void {
        console.log("You are back on track");
        this._routeResultOverride = undefined;
        this._mapStore.setCurrentMapModel(this._mapModel!);
    }

}