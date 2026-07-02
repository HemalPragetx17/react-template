import { Routing } from "../../routes/routing";
import { Modules } from "../enums/modules";

export interface ISidebarData {
  id?: number;
  module: string;
  route: string;
  name: string;
  icon?: string;
  childs?: ISidebarData[];
}

export const sidebarRoutes: ISidebarData[] = [
  {
    module: Modules.Dashboard,
    route: Routing.Dashboard,
    name: "Dashboard",
    icon: "dashboard",
  },
  {
    module: Modules.Users,
    route: Routing.Users,
    name: "Users",
    icon: "user",
  },
  {
    module: Modules.Settings,
    route: Routing.Settings,
    name: "Settings",
    icon: "setting",
    childs: [
      {
        module: Modules.TermsAndCondition,
        route: Routing.TermsAndCondition,
        name: "Terms & Condition",
        icon: "privacyPolicy",
      },
      {
        module: Modules.PrivacyPolicy,
        route: Routing.PrivacyPolicy,
        name: "Privacy Policy",
        icon: "privacyPolicy",
      },
      {
        module: Modules.AppSettings,
        route: Routing.AppSettings,
        name: "App Settings",
        icon: "appSetting",
      },
    ],
  },
  {
    module: Modules.UIKit,
    route: Routing.UIKit,
    name: "UI Kit",
    icon: "uiKit",
  },
];

