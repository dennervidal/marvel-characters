import React from "react";
import { Route, Routes } from "react-router-dom";
import { routes } from "../routes";
import NotFound from "pages/NotFound";
import { ErrorBoundary } from "components/ErrorBoundary";

export const RoutesList = () => (
  <ErrorBoundary>
    <Routes>
      {Object.values(routes).map(({ path, exact, component: Component }) => (
        <Route key={path} path={path} element={<Component />} exact={exact} />
      ))}
      <Route component={NotFound} />
    </Routes>
  </ErrorBoundary>
);
