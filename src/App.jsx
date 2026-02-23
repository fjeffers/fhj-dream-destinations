import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Home from "./pages/Home";
import AdminAppointments from "./pages/AdminAppointments";

export default function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/admin/appointments" component={AdminAppointments} />
        {/* other routes */}
      </Switch>
    </BrowserRouter>
  );
}
