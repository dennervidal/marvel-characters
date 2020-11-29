import React from "react";
import { Route, Switch } from "react-router-dom";
import { routes } from "../routes";
import NotFound from "pages/NotFound";
import { ErrorBoundary } from "components/ErrorBoundary";

export const RoutesList = () => (
  <ErrorBoundary>
    <Switch>
      {Object.values(routes).map(({ path, exact, component: Component }) => (
        <Route key={path} path={path} component={Component} exact={exact} />
      ))}
      <Route component={NotFound} />
    </Switch>
  </ErrorBoundary>
);
