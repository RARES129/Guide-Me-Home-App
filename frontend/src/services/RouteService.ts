export class RouteService {
    
    private _dirrectionService: google.maps.DirectionsService;
    private _directionRenderer: google.maps.DirectionsRenderer;

    constructor(private readonly _routesLibrary: google.maps.RoutesLibrary) {
        this._dirrectionService = new google.maps.DirectionsService();
        this._directionRenderer = new google.maps.DirectionsRenderer();
    }

    /**
     * calls the google maps api to get the route between two points
     * @param origin 
     * @param destination 
     * @returns a promise that resolves with the route
     */
    public async getRoute(origin: google.maps.LatLngLiteral, destination: google.maps.LatLngLiteral, waypoints: google.maps.LatLngLiteral[]): Promise<google.maps.DirectionsResult> {
        const directionRequest: google.maps.DirectionsRequest = {
            destination: destination,
            origin: origin,
            travelMode: google.maps.TravelMode.WALKING,
            waypoints: waypoints.map(waypoint => {
                return {
                    location: waypoint,
                    stopover: false
                };
            })
        }

        const resultPromise = new Promise<google.maps.DirectionsResult>((resolve, reject) => {
            this._dirrectionService.route(directionRequest,
                (result: google.maps.DirectionsResult, status: google.maps.DirectionsStatus) => {
                    if (status === google.maps.DirectionsStatus.OK) {
                        resolve(result);
                    } else {
                        console.error("RouteService: Failed to get route", status);
                        reject(status);
                    }
                });
        });
        
        return resultPromise;
    }

    public get directionRenderer(): google.maps.DirectionsRenderer {
        return this._directionRenderer;
    }
}