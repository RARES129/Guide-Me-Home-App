import { makeAutoObservable} from "mobx";
import { DEFAULT_MAP_CONTROLLER, MapController } from "../map/controllers/MapController";

export class MapControllerStore {

    private _controllers: MapController[] = [];


    constructor() {
        makeAutoObservable(this);
    }

    get currentController(): MapController {
        if (this._controllers.length === 0) {
            return DEFAULT_MAP_CONTROLLER;
        }
        return this._controllers[0];
    }

    public setCurrentController(controller: MapController) {
        this._controllers.push(controller);
    }

    public popController() {
        this._controllers.pop();
    }

}