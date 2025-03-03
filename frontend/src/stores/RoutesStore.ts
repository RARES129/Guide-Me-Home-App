import { makeAutoObservable} from "mobx";
import { RouteModel } from "../map/models/RouteModel";

export class RoutesStore {

    private _routes: RouteModel[] = [];
    private _selectedRoute: RouteModel | undefined;
    private _editable: boolean = false;

    constructor() {
        makeAutoObservable(this);
    }

    get routes(): RouteModel[] {
        return this._routes;
    }

    public addRoute(route: RouteModel): void {
        this._routes.push(route);
    }

    public removeRoute(route: RouteModel): void {
        const index = this._routes.indexOf(route);
        if (index === -1) {
            console.error("Route not found. This should not happen please look into it.");
            return;
        }
        this._routes.splice(index, 1);
    }

    public setRoutes(routes: RouteModel[]): void {
        this._routes = routes;
    }

    public selectRoute(route: RouteModel): void {
        this._selectedRoute = route;
    }

    public unselectRoute(): void {
        this._selectedRoute = undefined;
    }

    get selectedRoute(): RouteModel | undefined {
        return this._selectedRoute;
    }

    get editable(): boolean {
        return this._editable;
    }

    public setEditable(value: boolean) {
        this._editable = value;
    }

}