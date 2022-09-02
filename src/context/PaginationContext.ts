import { createContext } from "react";

const DEFAULT_STATE = {
  page: 0,
  gotoPage: () => {},
  total: 0,
  setTotal: () => {},
};

type PaginationContext = {
  page: number;
  gotoPage: (page: number) => void;
  total: number;
  setTotal: (total: number) => void;
};

export const PaginationContext =
  createContext<PaginationContext>(DEFAULT_STATE);
