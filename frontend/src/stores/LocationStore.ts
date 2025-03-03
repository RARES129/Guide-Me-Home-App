import { makeAutoObservable} from "mobx";
import { LocationObserver, LocationService } from "../services/LocationService";

export interface Coordonates {
    latitude: number;
    longitude: number;
}


export class LocationStore implements LocationObserver {

    private _coordonates: Coordonates = {
        latitude: 0,
        longitude: 0
    };
    private _heading: number | null = null;

    constructor(private readonly _locationService: LocationService) {
        makeAutoObservable(this);
        this._init();
    }

    private async _init(): Promise<void> {
        this._locationService.registerObserver(this);
    }

    onLocationChanged(position: GeolocationPosition): void {
        this._updateLocation(position);
    }

    onOrientationChanged(delta: number): void {
        // delta actually is in the inverse direction
        this._heading = ((this._heading || 0) - delta + 360) % 360;
    }


    get coordonates(): Coordonates {
        if (!this._coordonates) {
            throw new Error('No coordonates available');
        }
        return this._coordonates;
    }

    get heading(): number | null {
        return this._heading;
    }

    private _updateLocation(position: GeolocationPosition): void {
        this._coordonates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
        this._heading = position.coords.heading;
    }

}