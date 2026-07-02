import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { Routing } from "./routing";
import SuspenseFallback from "../components/loader/SuspenseFallback";

const Loadable = (Component: React.ComponentType) => () => {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Component />
    </Suspense>
  );
};

const PublicLayout = lazy(() => import("../layout/PublicLayout"));
const MainLayout = lazy(() => import("../layout/MainLayout"));

const LoginLayout = lazy(() => import("../pages/account/LoginLayout"));
const ForgotPassword = Loadable(lazy(() => import("../pages/account/ForgotPassword")));

const Dashboard = Loadable(lazy(() => import("../pages/dashboard/Dashboard")));
const DemoFormPage = Loadable(lazy(() => import("../pages/dashboard/DemoFormPage")));
const Users = Loadable(lazy(() => import("../pages/users/Users")));
const UserDetails = Loadable(lazy(() => import("../pages/users/UserDetails")));
const TermsAndCondition = Loadable(lazy(() => import("../pages/settings/termsAndCondition/TermsAndCondition")));
const PrivacyPolicy = Loadable(lazy(() => import("../pages/settings/privacyPolicy/PrivacyPolicy")));
const AppSettings = Loadable(lazy(() => import("../pages/settings/appSettings/AppSettings")));
const UIKit = Loadable(lazy(() => import("../pages/uikit/UIKit")));

const ErrorPage = Loadable(lazy(() => import("../pages/account/ErrorPage")));
const Error404Page = Loadable(lazy(() => import("../pages/account/Error404Page")));

const privateRoute = (Element: any, props?: any) => {
  return <ProtectedRoute element={props ? <Element {...props} /> : <Element />} />;
};

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to={Routing.Login} />,
  },
  {
    path: Routing.Login,
    element: (<PublicLayout><LoginLayout variant="two-column" /></PublicLayout>),
  },
  {
    path: Routing.ForgotPassword,
    element: (<PublicLayout><ForgotPassword /></PublicLayout>),
  },
  {
    path: Routing.Dashboard,
    element: <MainLayout>{privateRoute(Dashboard)}</MainLayout>,
  },
  {
    path: Routing.DemoFormPage,
    element: <MainLayout>{privateRoute(DemoFormPage)}</MainLayout>,
  },
  {
    path: Routing.Users,
    element: <MainLayout>{privateRoute(Users)}</MainLayout>,
  },
  {
    path: Routing.UserDetails,
    element: <MainLayout>{privateRoute(UserDetails)}</MainLayout>,
  },
  {
    path: Routing.TermsAndCondition,
    element: <MainLayout>{privateRoute(TermsAndCondition)}</MainLayout>,
  },
  {
    path: Routing.PrivacyPolicy,
    element: <MainLayout>{privateRoute(PrivacyPolicy)}</MainLayout>,
  },
  {
    path: Routing.AppSettings,
    element: <MainLayout>{privateRoute(AppSettings)}</MainLayout>,
  },
  {
    path: Routing.UIKit,
    element: <MainLayout>{privateRoute(UIKit)}</MainLayout>,
  },
  {
    path: Routing.ErrorPage,
    element: (<PublicLayout><ErrorPage /></PublicLayout>),
  },
  {
    path: "*",
    element: (<PublicLayout><Error404Page /></PublicLayout>),
  },
], {
  basename: import.meta.env.BASE_URL
});

const AppRouting = () => {
  return <RouterProvider router={routes} />;
};

export default AppRouting;
