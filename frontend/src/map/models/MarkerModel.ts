import { UUID } from "crypto";

export class MarkerModel {
    private _lat: number;
    private _lng: number;
    private _id: UUID;

    constructor(id: UUID, lat: number, lng: number) {
        this._lat = lat;
        this._lng = lng;
        this._id = id;
    }

    get position(): google.maps.LatLngLiteral {
        return { lat: this._lat, lng: this._lng };
    }

    get lat(): number {
        return this._lat;
    }

    get lng(): number {
        return this._lng;
    }

    get id(): UUID {
        return this._id;
    }
}


export class MarkerModelFactory {
    static create(lat: number, lng: number): MarkerModel {
        const id = crypto.randomUUID() as UUID;
        return new MarkerModel(id, lat, lng);
    }
    
    static createFromPoint(point: google.maps.LatLngLiteral): MarkerModel {
        const id = crypto.randomUUID() as UUID;
        return new MarkerModel(id, point.lat, point.lng);
    }

    static createFromPointWithId(id: UUID, point: google.maps.LatLngLiteral): MarkerModel {
        return new MarkerModel(id, point.lat, point.lng);
    }
}