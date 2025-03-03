import { MapMouseEvent } from "@vis.gl/react-google-maps";
import { MapController } from "./MapController";
import { MarkerModel, MarkerModelFactory } from "../models/MarkerModel";
import { MapStore } from "../../stores/MapStore";
import { RouteService } from "../../services/RouteService";
import { UUID } from "crypto";

const TIMEOUT_CLICK_AFTER_DRAG = 200;

export class RouteCreationMapController extends MapController {

    private _lastDragTime: number = 0;
    private _dragging = false;

    constructor(private readonly mapStore: MapStore,
                private readonly routesService: RouteService
    ) {
        super();
    }

    onClick(e: MapMouseEvent): void {
        if (Date.now() - this._lastDragTime < TIMEOUT_CLICK_AFTER_DRAG) {
            return;
        }

        const marker = this._createMarker(e.detail.latLng);
        this.mapStore.setMarkers([...this.mapStore.markers, marker]);  
        // TODO: find a better way for the updates
        // this.mapStore.setCurrentMapModel(MapModel.createCopy(this.editContext.mapModel));
        this._getRouteResult().then(result => {
            if (result) {
                this.mapStore.setRouteResult(result);
                // this.mapStore.setCurrentMapModel(MapModel.createCopy(this.editContext.mapModel));
            }
        });
    }

    onMarkerDrag(markerId: UUID, e: google.maps.MapMouseEvent): void {
        this._lastDragTime = Date.now();
        this._dragging = true;
        const markers = this.mapStore.markers;
        const marker = markers.find(m => m.id === markerId);
        if (marker) {
            const updatedMarker = MarkerModelFactory.createFromPointWithId(markerId, e.latLng.toJSON());
            this.mapStore.setMarkers(
                markers.map(m => m.id === markerId ? updatedMarker : m)
            )
            // this.mapStore.setCurrentMapModel(MapModel.createCopy(this.editContext.mapModel));
        } else {
            console.warn(`Marker with id ${markerId} not found. 
                This should not happen please look into it.`);
        }
    }

    onMarkerDragEnd(markerId: UUID, e: google.maps.MapMouseEvent): void {
        this.onMarkerDrag(markerId, e);
        this._getRouteResult().then(result => {
            if (result) {
                // TODO: make this async safe
                this.mapStore.setRouteResult(result);
                // this.mapStore.setCurrentMapModel(MapModel.createCopy(this.editContext.mapModel));
            }
        });
        this._dragging = false;
    }

    draggable(): boolean {
        return true;
    }

    private _createMarker(point: google.maps.LatLngLiteral): MarkerModel {
        return MarkerModelFactory.createFromPoint(point);
    }

    // TODO: this should be done on model update
    private async _getRouteResult(): Promise<google.maps.DirectionsResult> {
        const points = this.mapStore.markers.map(m => m.position);
        if (points.length < 2) {
            return undefined;
        }
        const routeResult = await this.routesService.getRoute(
            points[0],
            points[points.length - 1],
            points.slice(1, points.length - 1)
        );

        return routeResult;
    }


}