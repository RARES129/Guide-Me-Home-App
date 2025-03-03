import { makeAutoObservable, observable, override} from "mobx";
import { MarkerModel } from "../map/models/MarkerModel";
import { MapModel, MapModelFactory } from "../map/models/MapModel";
import { MapMouseEvent } from "@vis.gl/react-google-maps";
import { UUID } from "crypto";
import { MapController } from "../map/controllers/MapController";
import { RouteCreationMapController } from "../map/controllers/RouteCreationMapController";
import { RouteService } from "../services/RouteService";

export class MapStore {

    private _currentlyEditing: boolean = false;
    private _currentMapModel: MapModel = MapModelFactory.createEmpty();

    constructor(private readonly _routeService: RouteService) {
        makeAutoObservable(this,
            {
                // @ts-ignore private fields
                _currentMapModel: observable.deep
            }, { deep: true }
        );
    }

    get markers(): MarkerModel[] {
        return this._currentMapModel.markers;
    }

    get routeResult(): google.maps.DirectionsResult | undefined {
        return this._currentMapModel.routeResult;
    }

    get showUserLocation(): boolean {
        return this._currentMapModel.showUserLocation;
    }

    get currentMapModel(): MapModel {
        return this._currentMapModel;
    }

    public setCurrentMapModel(mapModel: MapModel) {
        this._currentMapModel = mapModel;
    }

    public setMarkers(markers: MarkerModel[]) {
        this._currentMapModel.markers = markers;
    }

    public setRouteResult(result: google.maps.DirectionsResult) {
        this._currentMapModel.routeResult = result;
    }

    public setShowUserLocation(showUserLocation: boolean) {
        this._currentMapModel.showUserLocation = showUserLocation;
    }

    public setController(controller: MapController) {
        this._currentMapModel.controller = controller;
    }

    public onClick(e: MapMouseEvent): void {
        this._currentMapModel.controller.onClick(e);
    }

    public onMarkerDrag(markerId: UUID, e: google.maps.MapMouseEvent): void {
        this._currentMapModel.controller.onMarkerDrag(markerId, e);
    }

    get draggable() {
        return this._currentMapModel.controller.draggable();
    }

    public onMarkerDragEnd(markerId: UUID, e: google.maps.MapMouseEvent): void {
        this._currentMapModel.controller.onMarkerDragEnd(markerId, e);
    }

    public setCurrentlyEditing(editing: boolean) {
        if (this._currentlyEditing === editing) {
            return;
        } else if (editing) {
            this._currentMapModel.controller = new RouteCreationMapController(this, this._routeService);
        } else {
            this._currentMapModel.controller = new MapController();
        }
        this._currentlyEditing = editing;
    }

    public get currentlyEditing(): boolean {
        return this._currentlyEditing;
    }

    public reset() {
        this._currentMapModel = MapModelFactory.createEmpty();
        this._currentlyEditing = false;
    }

}