import { lazy } from "react";
import { NotFound } from "../pages/NotFound/NotFound";

const Home = lazy(() => import("../pages/Home"));

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
