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
    redirect(history) {
      return history.push(this.path);
    },
  },
  SEARCH: {
    path: "/search",
    title: "Search",
    exact: true,
    component: Home,
    redirect(history, query) {
      return history.push(`${this.path}?query=${query}`);
    },
  },
  DETAILS: {
    path: "/details/:id",
    title: "Details",
    exact: true,
    component: Details,
    redirect(history, id) {
      return history.push(this.path.replace(":id", id));
    },
  },
  NOT_FOUND: {
    path: "/404",
    title: "Not Fund",
    exact: true,
    component: NotFound,
    redirect(history) {
      return history.push(this.path);
    },
  },
};
