import { observer } from "mobx-react";
import { RouteService } from "../../services/RouteService";
import { locator } from "../../AppInitializer";
import { useMap } from "@vis.gl/react-google-maps";
import { MapStore } from "../../stores/MapStore";

export const RouteRanditon = observer (() => {    
    
    const routeService = locator.get("RouteService") as RouteService;
    const mapStore = locator.get("MapStore") as MapStore;
    const map = useMap();
    const directionRenderer = routeService.directionRenderer;

    directionRenderer.setOptions({
        suppressMarkers: true,
    });
    
    if (mapStore.routeResult === undefined) {
        directionRenderer.setMap(null);
    } else {
        directionRenderer.setMap(map);
        directionRenderer.setDirections(mapStore.routeResult);
        
    }
   

    return (
        null
    );
});
