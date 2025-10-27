// src/router/AppRouter.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import ProjectsList from "../pages/Projects/ProjectsList";
import TaskList from "../pages/Tasks/TaskList";
import Settings from "../pages/Settings/Settings";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "../components/Layout";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Private (with layout) */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
