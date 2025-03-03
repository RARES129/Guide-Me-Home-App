import { MapMouseEvent } from "@vis.gl/react-google-maps";
import { UUID } from "crypto";

export class MapController {

    onClick(e: MapMouseEvent): void {
        return;
    }

    onDoubleClick(): void {
        return;
    }

    draggable(): boolean {
        return false;
    }

    onMarkerDrag(markerId: UUID, e: google.maps.MapMouseEvent): void {
        return;
    }

    onMarkerDragEnd(markerId: UUID, e: google.maps.MapMouseEvent): void {
        return;
    }

    onMarkerDoubleClick(markerId: UUID): void {
        return;
    }
}

export const DEFAULT_MAP_CONTROLLER = new MapController();