// src/App.jsx
import AppRouter from "./router/AppRouter";
import { AuthProvider } from "./context/AuthContext";
import "./styles/globals.css";

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
