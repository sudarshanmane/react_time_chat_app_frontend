import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Login from "./pages/login/login.jsx";
import Register from "./pages/register/register.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoutes from "./ProtectedRoutes.jsx";
import Chat from "./pages/chat/Chat";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/chat" />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoutes>
                <Chat />
              </ProtectedRoutes>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
