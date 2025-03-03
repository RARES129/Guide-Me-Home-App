import * as React from "react";
import { useEffect, useState } from "react";
import { BackButton } from "../../components/BackButton";
import { useNavigate } from "react-router-dom";
import { MapStore } from "../../stores/MapStore";
import { MapModelFactory } from "../../map/models/MapModel";
import { RouteService } from "../../services/RouteService";
import { MarkerModel } from "../../map/models/MarkerModel";
import {Button, Input, Layout, Modal, Spin, Tooltip} from "antd";
import { DeleteOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
import axios from "axios";
import {locator} from "../../AppInitializer";
import {DEFAULT_BACKEND_API_URL} from "../../ProjectDefaults";
import { getUserId } from "../../services/tokenDecoder";
import {RoutesStore} from "../../stores/RoutesStore"; // Import getUserId function
import { NavigationContext } from "../../map/utils/NavigationContext";

const { Content } = Layout;

export interface Route {
    routeId: string;
    name: string;
    waypoints: { lat: number; lng: number }[];
}

export const RoutesMenu: React.FC = () => {
    const navigate = useNavigate();
    const mapStore = locator.get("MapStore") as MapStore;
    const routeService = locator.get("RouteService") as RouteService;
    const routesStore = locator.get("RoutesStore") as RoutesStore;
    const navigationContext = locator.get("NavigationContext") as NavigationContext;

    const [routes, setRoutes] = useState<Route[]>([]);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editedName, setEditedName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [routeToEdit, setRouteToEdit] = useState<Route | null>();
    const [routeToDelete, setRouteToDelete] = useState<Route | null>(null);

    const fetchRoutes = async () => {
        try {
            const userId = getUserId();
            const response = await axios.get(`${DEFAULT_BACKEND_API_URL}/api/v1/route/retrieveRouteList`, {
                headers: {
                    "Content-Type": "application/json",
                },
                params: {
                    userId,
                },
            });
            routesStore.setRoutes(response.data);
            console.log("routes: ", response.data)
            setRoutes(response.data);
        } catch (error) {
            console.error("Failed to fetch routes", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutes();
    }, [routesStore]);

    const handleSelectRoute = async (route: Route) => {
        routesStore.selectRoute(route);
        routesStore.setEditable(true);

        const newModel = MapModelFactory.createFromWaypoints(route.waypoints);
        const result = await _getRouteResult(newModel.markers, routeService);
        newModel.routeResult = result;

        mapStore.setCurrentMapModel(newModel);
        navigationContext.startNavigation(result, {
            routeId: route.routeId,
            waypoints: route.waypoints,
            name: route.name,
        });
        navigate("/map");
    };

    const handleAddRoute = () => {
        routesStore.unselectRoute();
        routesStore.setEditable(true);

        const emptyModel = MapModelFactory.createEmpty();
        mapStore.setCurrentMapModel(emptyModel);

        navigate("/map");
    };

    const handleEditRouteName = (route) => {
        setRouteToEdit(route)
        setEditedName(route.name);
        setIsEditModalVisible(true);
    };

    const handleSaveEdit = async () => {
        if (routeToEdit && editedName && editedName !== routeToEdit.name) {
            try {
                console.log("userId: ",getUserId())
                console.log("routeId: ", routeToEdit.routeId);
                console.log("name", routeToEdit.name)
                console.log("waypoints: ",routeToEdit.waypoints)
                await axios.put(`${DEFAULT_BACKEND_API_URL}/api/v1/route`,
                    {
                        userId: getUserId(),
                        routeId: routeToEdit.routeId,
                        name: editedName,
                        waypoints: routeToEdit.waypoints
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                        }
                    }
                );
                fetchRoutes(); // Refresh routes after update
                setIsEditModalVisible(false); // Close modal
            } catch (error) {
                console.error("Failed to update route", error);
            }
        }
    };

    const showDeleteModal = (route: Route) => {
        setRouteToDelete(route);
        setIsModalVisible(true);
    };

    const handleConfirmDelete = async () => {
        if (!routeToDelete) return;

        try {
            console.log("route id:", routeToDelete.routeId)
            await axios.delete(`${DEFAULT_BACKEND_API_URL}/api/v1/route/deleteRoute`, {
                headers: {
                    "Content-Type": "application/json",
                },
                params: {
                    userId: getUserId(),
                    routeId: routeToDelete.routeId
                },
            });

            await fetchRoutes();
        } catch (error) {
            console.error("Failed to delete route", error);
        } finally {
            setIsModalVisible(false);
            setRouteToDelete(null);
        }
    };

    const handleCancelEdit = () => {
        setIsEditModalVisible(false);
        setRouteToEdit(null);
    };

    const handleCancelDelete = () => {
        setIsModalVisible(false);
        setRouteToDelete(null);
    };

    if (isLoading) {
        return <Spin size="large" style={{ display: "block", margin: "20% auto" }} />;
    }

    return (
        <div>
            <BackButton />
            <Layout style={{ minWidth: 240, maxWidth: 300, margin: "0 auto" }}>
                <Content style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {routes.map((route) => (
                        <div
                            key={route.routeId}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                width: "100%",
                                marginBottom: 16,
                            }}
                        >
                            <Button
                                size="large"
                                style={{ flex: 1, marginRight: 8 }}
                                onClick={() => handleSelectRoute(route)}
                            >
                                {route.name}
                            </Button>
                            <Button
                                icon={<EditOutlined />}
                                onClick={() => handleEditRouteName(route)}
                                style={{ marginRight: 8 }}
                            />
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => showDeleteModal(route)}
                            />
                        </div>
                    ))}
                    <Tooltip title="Add New Route">
                        <Button
                            size="large"
                            shape="circle"
                            icon={<PlusOutlined />}
                            onClick={handleAddRoute}
                        />
                    </Tooltip>
                </Content>
            </Layout>

            {/* Edit Route Modal */}
            <Modal
                title="Edit Route Name"
                visible={isEditModalVisible}
                onOk={handleSaveEdit}
                onCancel={handleCancelEdit}
                okText="Save"
                cancelText="Cancel"
            >
                <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="Enter new route name"
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                title="Confirm Delete"
                visible={isModalVisible}
                onOk={handleConfirmDelete}
                onCancel={handleCancelDelete}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to delete the route <strong>{routeToDelete?.name}</strong>?</p>
            </Modal>
        </div>
    );
};

async function _getRouteResult(markers: MarkerModel[], routeService: RouteService): Promise<google.maps.DirectionsResult> {
    const points = markers.map((m) => m.position);
    if (points.length < 2) {
        return undefined;
    }
    return routeService.getRoute(points[0], points[points.length - 1], points.slice(1, points.length - 1));
}