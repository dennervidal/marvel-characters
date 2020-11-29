import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { routes } from "../routes";
import { NotFound } from "../../pages/NotFound/NotFound";
import { ErrorBoundary } from "../../components/ErrorBoundary/ErrorBoundary";

export const RoutesList = () => (
  <ErrorBoundary>
    <Switch>
      {/*<Redirect exact from="/" to={routes.LIST.path} />*/}
      {Object.values(routes).map(({ path, exact, component: Component }) => (
        <Route key={path} path={path} component={Component} exact={exact} />
      ))}
      <Route component={NotFound} />
    </Switch>
  </ErrorBoundary>
);
