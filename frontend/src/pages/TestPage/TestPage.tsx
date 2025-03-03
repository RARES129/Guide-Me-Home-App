import * as React from "react";
import { locator } from "../../AppInitializer";

/**
 * Component used for debug and testing purposes
 */
const TestPage = () => {

    const locationService = locator.get("LocationService");

    return (
        <div>
           <button onClick={locationService.printCurrentPosition}>Print position</button>
           <button onClick={locationService.startPrintingDirection}>Start print direction</button>
            <button onClick={locationService.stopPrintingDirection}>Stop print direction</button>
        </div>
    );
};

export default TestPage;