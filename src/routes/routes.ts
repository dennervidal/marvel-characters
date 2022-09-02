import { lazy } from "react";
import NotFound from "pages/NotFound";
import { NavigateFunction } from "react-router";

const Home = lazy(() => import("pages/Home"));
const Details = lazy(() => import("pages/Details"));

export const routes = {
  HOME: {
    path: "/",
    title: "Home",
    exact: true,
    component: Home,
    redirect(navigate: NavigateFunction) {
      return navigate(this.path);
    },
  },
  SEARCH: {
    path: "/search",
    title: "Search",
    exact: true,
    component: Home,
    redirect(navigate: NavigateFunction, query: string) {
      return navigate(`${this.path}?query=${query}`);
    },
  },
  DETAILS: {
    path: "/details/:id",
    title: "Details",
    exact: true,
    component: Details,
    redirect(navigate: NavigateFunction, id: string | number | undefined) {
      return navigate(this.path.replace(":id", String(id)));
    },
  },
  NOT_FOUND: {
    path: "/404",
    title: "Not Fund",
    exact: true,
    component: NotFound,
    redirect(navigate: NavigateFunction) {
      return navigate(this.path);
    },
  },
};
