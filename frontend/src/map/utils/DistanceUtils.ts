import { toLatLngLiteral } from "@vis.gl/react-google-maps";

export type Point = google.maps.LatLngLiteral;

const EARTH_RADIUS = 6371e3;

export class DistanceUtils {

    constructor() {}

    public resultToPath(result: google.maps.DirectionsResult): Point[] {
        const route = result.routes[0];
        const path = route.overview_path;
        return path.map(toLatLngLiteral)
    }

    public distanceFromPath(point: Point, path: Point[]): number {
        return this.distanceTwoPoints(point, this.closestPointOnPath(point, path));
    }

    public closestPointOnPath(point: Point, path: Point[]): Point {
        let minDistance = Number.MAX_VALUE;
        let closestPoint = path[0];
        for (let i = 0; i < path.length - 1; i++) {
            const projection = this.closestPointOnSegment(point, path[i], path[i + 1]);
            const distance = this.distanceTwoPoints(point, projection);
            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = projection;
            }
        }
        return closestPoint;
    }

    /**
     * Assumption: the earth is flat
     * explaination: the globe curvature and altitude are negligible for our usecase
     * 
     * Disclaimer: this fails for points that are over the poles or the international date line
     * TODO: fix this
     */
    closestPointOnSegment(point: Point, start: Point, end: Point): Point {
        const x = point.lng;
        const y = point.lat;
        const x1 = start.lng;
        const y1 = start.lat;
        const x2 = end.lng;
        const y2 = end.lat;

        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        if (len_sq !== 0) {
            param = dot / len_sq;
        }

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        return { lat: yy, lng: xx };
    }

    /**
     * Returns the distance between two points in meters
     */
    public distanceTwoPoints(point1: Point, point2: Point): number {
        const lat1 = this.toRadians(point1.lat);
        const lat2 = this.toRadians(point2.lat);
        const deltaLat = this.toRadians(point2.lat - point1.lat);
        const deltaLng = this.toRadians(point2.lng - point1.lng);

        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c;
    }
    

    private toRadians(degrees: number): number {
        return degrees * Math.PI / 180;
    }
}