import axios from "axios";
import { DEFAULT_BACKEND_API_URL } from "../../ProjectDefaults";
import { getUserId } from "../../services/tokenDecoder";
import { DistanceUtils } from "./DistanceUtils";

export interface TrackingObserver {
    onTrackedLocationChanged: (position: google.maps.LatLngLiteral) => void;
}

interface API_RESPONSE {
    latitude: number;
    longitude: number;
    timestamp: number;
}

const DISTANCE_THRESHOLD = 100;

export class TrackingService {

    private _observers: TrackingObserver[] = [];
    private _currentLocation: google.maps.LatLngLiteral | undefined;

    constructor(private readonly _distanceUtils: DistanceUtils) {
        this._watchPosition();
    }

    private async _getTrackedLocation(): Promise<google.maps.LatLngLiteral> {
        const API_PATH = `${DEFAULT_BACKEND_API_URL}/api/v1/live-tracking/${getUserId()}`;
        const response = await axios.get(API_PATH)

        if (response.status === 200) {
            const data = response.data as API_RESPONSE;
            return { lat: data.latitude, lng: data.longitude };
        }
        console.error("Error getting tracked location:", response);
    }

    public registerObserver(observer: TrackingObserver) {
        this._observers.push(observer);
    }

    public unregisterObserver(observer: TrackingObserver) {
        const index = this._observers.indexOf(observer);
        if (index !== -1) {
            this._observers.splice(index, 1);
        }
    }

    private async _watchPosition() {
        this._currentLocation = await this._getTrackedLocation();
        const watchId = setInterval(async () => {
            if (this._observers.length === 0)
                return;
            const trackedLocation = await this._getTrackedLocation();
            if (this._distanceUtils.distanceTwoPoints(trackedLocation, this._currentLocation) < DISTANCE_THRESHOLD)
                return;
            this._currentLocation = trackedLocation;
            for (const observer of this._observers) {
                observer.onTrackedLocationChanged(this._currentLocation);
            }
        }, 5000);

        return watchId;
    }

    public async getUserLocation(): Promise<google.maps.LatLngLiteral> {
        return await this._getTrackedLocation();
    }




}