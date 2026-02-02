import React from "react";
import {
  BrowserRouter,
  Routes as RouterRoutes,
  Route
} from "react-router-dom";

// Temporary fallback pages
const NotFound = () => <div className="p-4">Page not found</div>;

import HomeDashboard from "./pages/home-dashboard";

const Routes = () => {
  return (
    <BrowserRouter>
      <RouterRoutes>
        <Route path="/" element={<HomeDashboard />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
    </BrowserRouter>
  );
};

export default Routes;
