export interface PlaceResult {
    displayName: string;
    location: google.maps.LatLngLiteral;
}

export class PlacesService
{
    private _placesServiceInstance: google.maps.places.PlacesService;

    constructor(private readonly _placeLibrary: google.maps.PlacesLibrary) {
    }

    async getNearbyPlaces(location: google.maps.LatLngLiteral): Promise<PlaceResult[]> {
        const request: google.maps.places.SearchNearbyRequest = {
            // required parameters
            fields: ['displayName', 'location', 'businessStatus'],
            locationRestriction: {
                center: location,
                radius: 500, 
            },
            // optional parameters
            includedPrimaryTypes: ['restaurant', 'cafe'],
            maxResultCount: 5,
            rankPreference: google.maps.places.SearchNearbyRankPreference.DISTANCE,
            language: 'ro',
            region: 'ro',
        };
        
        const response = await this._placeLibrary.Place.searchNearby(request);

        return response.places.filter(
            (place) => place.businessStatus === google.maps.places.BusinessStatus.OPERATIONAL && place.location
        ).map((place) => {
            return {
                displayName: place.displayName,
                location: place.location?.toJSON(),}
        });

    }


}