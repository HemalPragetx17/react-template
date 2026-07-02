import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { ILoginResponseModel } from "../../models/account";
import type { IAuthState } from "../state/app-state";

const initialState: IAuthState = {
  id: "",
  email: "",
  phone: "",
  role: "",
  token: "",
  first_name: "",
  last_name: "",
  is_active: false
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    adminLogin: (state: IAuthState, action: PayloadAction<ILoginResponseModel>) => {
      state.id = action.payload.user.id ?? "";
      state.email = action.payload.user.email ?? "";
      state.phone = action.payload.user.phone ?? "";
      state.role = action.payload.user.role ?? "";
      state.token = action.payload.token;
      state.first_name = action.payload.user.first_name;
      state.last_name = action.payload.user.last_name;
      state.is_active = action.payload.user.is_active ?? false;
    },

    adminLogout: () => initialState,

    // updatePermission: (state, action: PayloadAction<IRoutesModel[]>) => {
    //   const permissions = action.payload?.sort((a, b) => (a?.priority > b?.priority ? 1 : -1));
    //   const newPermission: ISidebarData[] = permissions?.map((route) => {
    //     const module = sidebarRoutes?.find((x) => x?.module === route?.name);
    //     if (route?.childRoute?.length > 0) {
    //       const childRoutes = route?.childRoute?.sort((a, b) => (a?.priority > b?.priority ? 1 : -1));
    //       return {
    //         ...module,
    //         id: route?.id,
    //         childs: childRoutes
    //           ?.map((routeChild) => {
    //             const child = sidebarRoutes?.find((x) => x?.module === routeChild?.name);
    //             if (routeChild?.childRoute?.length > 0) {
    //               const subChildRoutes = routeChild?.childRoute?.sort((a, b) => (a?.priority > b?.priority ? 1 : -1));
    //               return {
    //                 ...child,
    //                 id: routeChild?.id,
    //                 childs: subChildRoutes
    //                   ?.map((subRouteChild) => {
    //                     const child = sidebarRoutes?.find((x) => x?.module === subRouteChild?.name);
    //                     if (child?.name) {
    //                       return { id: subRouteChild?.id, ...child };
    //                     }
    //                   })
    //                   .filter((x) => !!x?.name),
    //               }
    //             }
    //             if (child?.name) {
    //               return { id: routeChild?.id, ...child };
    //             }
    //           })
    //           .filter((x) => !!x?.name),
    //       };
    //     } else {
    //       return { id: route?.id, ...module };
    //     }
    //   });
    //   state.permissions = newPermission?.filter((x) => !!x?.name) || [];
    // },
  },
});

export const { adminLogin, adminLogout } =
  authSlice.actions;

export default authSlice.reducer;
