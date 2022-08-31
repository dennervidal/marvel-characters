import { lazy } from "react";
import NotFound from "pages/NotFound";

const Home = lazy(() => import("pages/Home"));
const Details = lazy(() => import("pages/Details"));

export const routes = {
  HOME: {
    path: "/",
    title: "Home",
    exact: true,
    component: Home,
    redirect(navigate) {
      return navigate(this.path);
    },
  },
  SEARCH: {
    path: "/search",
    title: "Search",
    exact: true,
    component: Home,
    redirect(navigate, query) {
      return navigate(`${this.path}?query=${query}`);
    },
  },
  DETAILS: {
    path: "/details/:id",
    title: "Details",
    exact: true,
    component: Details,
    redirect(navigate, id) {
      return navigate(this.path.replace(":id", id));
    },
  },
  NOT_FOUND: {
    path: "/404",
    title: "Not Fund",
    exact: true,
    component: NotFound,
    redirect(navigate) {
      return navigate(this.path);
    },
  },
};
