import * as React from "react";
import { useState, useEffect } from "react";
import {Menu, Button, Drawer, Typography, Layout, Modal} from "antd";
import { HomeOutlined, SettingOutlined, InfoCircleOutlined, UpSquareOutlined, ExclamationCircleOutlined, QuestionCircleOutlined, PoweroffOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { MapStore } from "../../stores/MapStore";
import { locator } from "../../AppInitializer";
import axios from "axios";
import { DEFAULT_BACKEND_API_URL } from "../../ProjectDefaults";
import { getUserId, getUserRole } from "../../services/tokenDecoder";
import { RouteService } from "../../services/RouteService";
import { TrackingContext } from "../../map/utils/TrackingContext";
import { clearFcmToken } from "../../services/NotificationService";
import { PlaceResult, PlacesService } from "../../services/PlacesService";
import { NavigationContext } from "../../map/utils/NavigationContext";
import { RouteModel } from "../../map/models/RouteModel";
import { LocationStore } from "../../stores/LocationStore";
import { MapModelFactory } from "../../map/models/MapModel";

const { Content } = Layout;
const { Title } = Typography;

const Home: React.FC = () => {
    const [visible, setVisible] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [places, setPlaces] = useState([]);
    const routeService = locator.get("RouteService") as RouteService;
    const locationStore = locator.get("LocationStore") as LocationStore;
    const trackingContext = locator.get("TrackingContext") as TrackingContext;
    const placesService = locator.get("PlacesService") as PlacesService;
    const navigationContext = locator.get("NavigationContext") as NavigationContext;

    const navigate = useNavigate();
    const mapStore = locator.get("MapStore") as MapStore;

    useEffect(() => {
        // Fetch the user's role when the component mounts
        const fetchRole = async () => {
            const userRole = await getUserRole(); // Assuming getUserRole returns a promise
            setRole(userRole);
        };
        fetchRole();
    }, []);

    const toggleDrawer = () => {
        setVisible(!visible);
    };

    const liveTracking = () => {
        console.log("live tracking started");
        trackingContext.startTracking();
        navigate("/map");
    };

    const handleMenuClick = (key: string) => {
        console.log("Clicked menu item: ", key);
        setVisible(false);
    };

    const showModal = () => {
        if (role === "user")
            setIsModalVisible(true);
    };

    const handleStay = () => {
        console.log("User chose to stay.");
        setIsModalVisible(false);
    };

    const handleChoosePlace = () => {
        console.log("User chose to go to a safe area.");
        const currentPosition = {
            lat: locationStore.coordonates.latitude,
            lng: locationStore.coordonates.longitude
        }
        placesService.getNearbyPlaces(currentPosition).then((places) => {
            if (places.length === 0) {
                alert("No safe areas found nearby.");
                return;
            }
            setPlaces(places);
        });
        
    }

    const selectPlace = async (place: PlaceResult) => {
        console.log("User chose to go to a safe area.");
        const currentPosition = {
            lat: locationStore.coordonates.latitude,
            lng: locationStore.coordonates.longitude
        }
        mapStore.reset();
        const placeRoute: RouteModel = {
            routeId: "NO ID",
            waypoints: [currentPosition, place.location],
            name: ""
        }
        const mapModel = MapModelFactory.createFromWaypoints(placeRoute.waypoints);
        mapStore.setCurrentMapModel(mapModel);
        const routeResult = await routeService.getRoute(currentPosition, place.location, []);
        mapStore.setRouteResult(routeResult);
        navigationContext.startNavigation(routeResult, placeRoute);
        navigate("/map");
    }

    return (
        <div>
            <Button type="primary" onClick={toggleDrawer} style={{ position: "fixed", top: 10, left: 10 }}>
                Menu
            </Button>

            <Drawer
                title="Navigation"
                placement="left"
                onClose={toggleDrawer}
                visible={visible}
                bodyStyle={{ padding: 0 }}
            >
                <Menu
                    mode="inline"
                    onClick={(e) => handleMenuClick(e.key)}
                    style={{ borderRight: 0 }}
                >
                    <Menu.Item key="home" icon={<HomeOutlined />}>
                        Home
                    </Menu.Item>
                    {role === "user" && (
                        <Menu.Item key="contacts" icon={<HomeOutlined />} onClick={(e) => navigate("/contacts")}>
                            Emergency Contacts
                        </Menu.Item>
                    )}
                    <Menu.Item key="about" icon={<UpSquareOutlined />} onClick={(e) => { mapStore.reset(); navigate("/map") }}>
                        Free Roam
                    </Menu.Item>
                    <Menu.Item key="settings" icon={<SettingOutlined />}>
                        Settings
                    </Menu.Item>
                    <Menu.Item key="about" icon={<QuestionCircleOutlined />}>
                        About
                    </Menu.Item>
                    <Menu.Item
                        key="logout"
                        icon={<PoweroffOutlined />}
                        onClick={async () => {
                            localStorage.removeItem("isAuthenticated");
                            localStorage.removeItem("role");
                            clearFcmToken(localStorage.getItem("token"));
                            localStorage.removeItem("token");
                            navigate("/login");
                            window.location.reload();
                        }}
                    >
                        Logout
                    </Menu.Item>
                </Menu>
            </Drawer>
            <Title level={2}>GUIDE ME HOME</Title>
            <Layout style={{ maxWidth: 300, margin: "0 auto" }}>
                <Content style={{ display: "flex", flexDirection: "column" }}>
                    <Button
                        type="primary"
                        shape="circle"
                        size="large"
                        style={{
                            height: "100px",
                            backgroundColor: role === "assistant" ? "blue" : "red",
                            borderColor: role === "assistant" ? "blue" : "red",
                            color: "white",
                            fontSize: "24px",
                            fontWeight: "bold",
                            marginTop: "60px",
                            marginBottom: "20px"
                        }}
                        onClick={async () => {
                            if (role === "assistant") {liveTracking()} else {
                                const currentUserId = getUserId();
                                const alertData = {
                                    senderId: currentUserId,
                                    reason: "User pressed alert button"
                                };

                                try {
                                    const response = await axios.post(
                                        `${DEFAULT_BACKEND_API_URL}/api/v1/alert`,
                                        alertData,
                                        {
                                            headers: {
                                                "Content-Type": "application/json"
                                            }
                                        }
                                    );

                                    if (response.status === 200) {
                                        alert("Alert sent successfully!");
                                    } else {
                                        alert("Failed to send alert. Please try again.");
                                    }
                                } catch (error) {
                                    console.error("Error sending alert:", error);
                                    alert("An error occurred while sending the alert. Please try again later.");
                                }
                            }
                            showModal()
                        }}
                    >
                        {role === "assistant" ? "Track" : "Panic"}
                    </Button>

                    {role === "user" && ( <Button
                        type="default"
                        size="large"
                        style={{ marginBottom: 16 }}
                        onClick={() => navigate("/contacts")}
                    >
                        Contacts
                    </Button>
                    )}

                    {role === "user" && ( <Button
                        type="default"
                        size="large"
                        style={{ marginBottom: 16 }}
                        onClick={() => navigate("/routes")}
                    >
                        Routes
                    </Button>
                    )}
                </Content>
                <Modal
                    title="Panic Options"
                    visible={isModalVisible}
                    onCancel={() => {setIsModalVisible(false); setPlaces([]);}}
                    footer={null}
                >
                    {
                        places.length === 0 ? (
                            <><Button type="primary" onClick={handleStay} style={{ marginRight: 8 }}>
                                Stay
                            </Button><Button type="default" onClick={handleChoosePlace}>
                                    Go to a Safe Area
                                </Button></>
                        ) : (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                rowGap: 8,
                            }}
                        >
                            {
                        places.map((place: PlaceResult) => {
                            return (
                                <Button 
                                type="default"     
                                onClick={() => {
                                    selectPlace(place);
                                    setIsModalVisible(false);
                                }}>
                                    {place.displayName}
                                </Button>
                            )
                        })
                    }
                        </div>
                    )
                            
                        

                    }
                    
                </Modal>
            </Layout>
        </div>
    );
};

export default Home;
