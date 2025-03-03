import * as React from "react";
import MapWrapper from "../../map/components/MapWrapper";
import { locator } from "../../AppInitializer";
import { MapStore } from "../../stores/MapStore";
import { observer } from "mobx-react";
import { BackButton } from "../../components/BackButton";
import { RoutesStore } from "../../stores/RoutesStore";
import { RouteModelFactory } from "../../map/models/RouteModel";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DEFAULT_BACKEND_API_URL } from "../../ProjectDefaults";
import { Button, Modal, Input } from "antd";
import { getUserId } from "../../services/tokenDecoder";
import { NavigationContext } from "../../map/utils/NavigationContext";
import { TrackingContext } from "../../map/utils/TrackingContext";

const Map = observer(() => {
  const mapStore = locator.get("MapStore") as MapStore;
  const routesStore = locator.get("RoutesStore") as RoutesStore;
  const navigationContext = locator.get("NavigationContext") as NavigationContext;
  const trackingContext = locator.get("TrackingContext") as TrackingContext;
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [routeName, setRouteName] = React.useState("");



  const editRoute = () => {
    // Destructure route details
    const selectedRoute = routesStore.selectedRoute;
    const route = RouteModelFactory.createFromMapModel(
        mapStore.currentMapModel,
        selectedRoute.name,
        selectedRoute.routeId
    );
    const payload = {
      userId: getUserId(),
      routeId: route.routeId,
      name: route.name,
      waypoints: route.waypoints
    }
    axios
        .put(`${DEFAULT_BACKEND_API_URL}/api/v1/route`, payload, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((r) => console.log(route));
    stopEdit();
    navigate("/routes");
  }

  const saveRoute = (name: string) => {
    const route = RouteModelFactory.createFromMapModel(
      mapStore.currentMapModel,
      name
    );
    mapStore.reset();
    routesStore.addRoute(route);
    const payload = {
      userId: getUserId(),
      name: route.name,
      waypoints: route.waypoints,
    };
    console.log(payload);
    axios
      .post(`${DEFAULT_BACKEND_API_URL}/api/v1/route`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((r) => console.log(route));
    navigate("/routes");
  };

  const handleSave = () => {
    // if (routesStore.selectedRoute !== undefined) {
    //   editRoute();
    // }

    if (mapStore.currentlyEditing && routesStore.selectedRoute === undefined) {
      setIsModalVisible(true);
    }
      else if (mapStore.currentlyEditing && routesStore.selectedRoute !== undefined) {
        editRoute()
      } else {
      startEdit();
    }
  };

  const handleOk = () => {
    saveRoute(routeName);
    setIsModalVisible(false);
    setRouteName("");
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setRouteName("");
  };

  const startEdit = () => {
    mapStore.setCurrentlyEditing(true);
  };

  const stopEdit = () => {
    mapStore.setCurrentlyEditing(false);
    routesStore.setEditable(false);
  }

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {routesStore.editable && (
        <Button
          type="primary"
          onClick={handleSave}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 1000,
          }}
        >
          {mapStore.currentlyEditing ? "Save" : "Edit"}
        </Button>
      )}
      <Modal
        title="Save Route"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Save"
        cancelText="Cancel"
      >
        <Input
          placeholder="Enter route name"
          value={routeName}
          onChange={(e) => setRouteName(e.target.value)}
        />
      </Modal>
      <div
        onClick={() => {
          stopEdit();
          navigationContext.stopNavigation();
          trackingContext.stopTracking();
        }}
      >
        <BackButton />
      </div>
      <MapWrapper />
    </div>
  );
});

export default Map;
