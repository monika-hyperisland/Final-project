import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import DashboardPage from "./pages/DashboardPage/DashboardPage";
import GroupPage from "./pages/GroupPage/GroupPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/groups/:id" element={<GroupPage />} />
    </Routes>
  );
}

export default App;