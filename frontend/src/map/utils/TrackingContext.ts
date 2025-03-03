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
import { TrackingObserver, TrackingService } from "./TrackingService";

const LOST_DISTANCE = 200;


export class TrackingContext implements TrackingObserver, LocationObserver {
    private _currentRouteResult?: google.maps.DirectionsResult;
    private _ongoingTracking = false;
    private _routeEndLocation?: google.maps.LatLngLiteral;
    private _trueStartLocation: google.maps.LatLngLiteral;
    private _trueEndLocation: google.maps.LatLngLiteral;
    private _rerouting = false;
    
    constructor(
        private readonly _locationService: LocationService,
        private readonly _distanceUtils: DistanceUtils,
        private readonly _navigationUtils: NavigationUtils,
        private readonly _routeService: RouteService,
        private readonly _mapStore: MapStore,
        private readonly _trackingService: TrackingService

    ) { 
        this._locationService.registerObserver(this);
    }

    onLocationChanged(position: Position): void {
        this._trueStartLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        }
        this._checkReroute();
    }

    onTrackedLocationChanged(position: google.maps.LatLngLiteral) {
        this._trueEndLocation = {
            lat: position.lat,
            lng: position.lng
        }
        this._checkReroute();
    }

    private _checkReroute(): void {
        if (this._shouldReroute()) {
            this._rerouting = true;
            this._getResults().then((result) => {
                this._currentRouteResult = result;
                this._routeEndLocation = this._trueEndLocation;
                this._mapStore.setCurrentMapModel({
                    markers: [this._trueStartLocation, this._trueEndLocation].map((point) => MarkerModelFactory.createFromPoint(point)),
                    showUserLocation: true,
                    routeResult: result,
                    controller: new MapController()
                });
                this._rerouting = false;
            });
        }
    }
    
    private async _getResults(): Promise<google.maps.DirectionsResult> {
        return await this._routeService.getRoute(this._trueStartLocation, this._trueEndLocation, []);
    }

    private _shouldReroute(): boolean {
        if (!this._ongoingTracking) {
            return false;
        }
        if (this._rerouting) {
            return false;
        }
        if (!this._trueEndLocation) {
            console.error("End location should be available");
            return false;
        }
        if (!this._trueStartLocation) {
            console.error("Start location should be available");
            return false;
        }
        if (!this._currentRouteResult) {
            return true;
        }
        if(!this._navigationUtils.isCloseToRoute(this._currentRouteResult, LOST_DISTANCE)) {
            return true;
        }
        if(this._distanceUtils.distanceTwoPoints(this._trueEndLocation, this._routeEndLocation!) > 100) {
            return true;
        }
        return false;
    }

    public async startTracking(): Promise<void> {
        this._trackingService.registerObserver(this);
        this._trueEndLocation = await this._trackingService.getUserLocation();
        this._checkReroute();
        this._ongoingTracking = true;
    }

    public stopTracking(): void {
        this._trackingService.unregisterObserver(this);
        this._ongoingTracking = false;
    }

}