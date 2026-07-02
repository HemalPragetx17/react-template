import type { IconType } from "react-icons";
import {
  FaGear,
  FaUser,
} from "react-icons/fa6";
import { LuClipboardCheck } from "react-icons/lu";
import { MdDashboard, MdOutlineAppSettingsAlt, MdPalette } from "react-icons/md";

export const sidebarIcons: Record<string, IconType> = {
  dashboard: MdDashboard,
  user: FaUser,
  setting: FaGear,
  privacyPolicy: LuClipboardCheck,
  appSetting: MdOutlineAppSettingsAlt,
  uiKit: MdPalette,
};

interface SidebarMenuIconProps {
  name: string;
  className?: string;
}

export function SidebarMenuIcon({ name, className }: SidebarMenuIconProps) {
  const IconComponent = sidebarIcons[name];
  if (!IconComponent) return null;
  return <IconComponent className={className} aria-hidden />;
}
