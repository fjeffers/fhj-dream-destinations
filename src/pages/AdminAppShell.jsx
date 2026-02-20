import React, { useState } from "react";
import AdminLogin from "./AdminLogin.jsx";
import AdminDashboard from "./AdminDashboard.jsx";

export default function AdminAppShell() {
  const [admin, setAdmin] = useState(null);

  return (
    <div>
      {!admin ? (
        <AdminLogin onLogin={(user) => setAdmin(user)} />
      ) : (
        <AdminDashboard admin={admin} />
      )}
    </div>
  );
}
