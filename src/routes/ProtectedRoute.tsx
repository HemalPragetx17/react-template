import { useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { adminLogout } from "../store/slices/authSlice";
import store from "../store/store";
import { Routing } from "./routing";

import type { ReactNode } from "react";

const ProtectedRoute = ({ element }: { element: ReactNode }) => {
  const dispatch = useDispatch();
  const state = store?.getState();

  const isAuthenticated = Boolean(
    state?.UserData?.accessToken && state?.UserData?.email,
  );

  if (!isAuthenticated) {
    dispatch(adminLogout());
    return <Navigate to={Routing.Login} />;
  }

  return <>{element}</>;
};

export default ProtectedRoute;
