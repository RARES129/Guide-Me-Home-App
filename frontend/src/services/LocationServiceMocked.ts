
import type { Position } from "@capacitor/geolocation";
import { LocationObserver, LocationService } from "./LocationService";

export class LocationServiceMocked implements LocationService {
    private _observers: LocationObserver[] = [];

  constructor() {
    // @ts-ignore - this is a testing mock
    // eslint-disable-next-line no-restricted-globals
    self.locationService = this;
  }

  registerObserver(observer: LocationObserver) {
    this._observers.push(observer);
  }

  unregisterObserver(observer: LocationObserver) {
    const index = this._observers.indexOf(observer);
    if (index !== -1) {
      this._observers.splice(index, 1);
    }
  }

  public setCurrentPosition(lat: number, lng: number) {
    const position: Position = {
        timestamp: 0,
        coords: {
            latitude: lat,
            longitude: lng,
            accuracy: 0,
            altitudeAccuracy: 0,
            altitude: 0,
            speed: 0,
            heading: 0
        }
    }

    for (const observer of this._observers) {
      observer.onLocationChanged(position);
    }
  }
}
