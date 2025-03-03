import "./App.css";
import * as React from "react";
import { Route, Navigate, Routes } from "react-router-dom";
import Register from "./pages/Register/RegisterHandler";
import Login from "./pages/Login/LoginHandler";
import ProtectedRoute from "./routes/ProtectedRoute";
import Home from "./pages/Home/Home";
import Map from "./pages/Map/Map";
import TestPage from "./pages/TestPage/TestPage";
import { APIProvider } from "@vis.gl/react-google-maps";
import { AppInitializer } from "./AppInitializer";
import Contacts from "./pages/Contacts/Contacts";
import { RoutesMenu } from "./pages/RoutesMenu/RoutesMenu";
import { useEffect } from 'react';
import { setupNotificationListeners } from './services/NotificationService';

function App() {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  const [appInitialized, setAppInitialized] = React.useState(false);

  useEffect(() => {
    setupNotificationListeners();
  }, []);

  return (
    <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      { !appInitialized &&
        <AppInitializer appInitializedCallback={() => setAppInitialized(true)} />}
      {
        appInitialized &&
        <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
        />

        <Route element={<ProtectedRoute isAuth={isAuthenticated} />}>
          <Route path="/" element={<Home />} />
        </Route>
        <Route element={<ProtectedRoute isAuth={isAuthenticated} />}>
          <Route path="/map" element={<Map />} />
        </Route>
        <Route element={<ProtectedRoute isAuth={isAuthenticated} />}>
            <Route path="/contacts" element={<Contacts />} />
        </Route>
        <Route element={<ProtectedRoute isAuth={isAuthenticated} />}>
          <Route path="/routes" element={<RoutesMenu/>} />
        </Route>
        <Route path="/debug" element={<TestPage></TestPage>} />

        <Route path="/debug" element={<TestPage></TestPage>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      }
      
    </APIProvider>
  );
}

export default App;
