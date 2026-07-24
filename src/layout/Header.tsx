import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import NotificationsMenu from '../components/header/NotificationsMenu';
import UserMenu from '../components/header/UserMenu';
import { Routing } from '../routes/routing';
import { adminLogout } from '../store/slices/authSlice';
import ThemeToggle from '../components/themeToggle/ThemeToggle';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '../components/ui';
import { sidebarRoutes, type ISidebarData } from '../shared/constants/sidebar-data';
import { SidebarMenuIcon } from '../shared/sidebar-icons';
import { FaChevronDown } from 'react-icons/fa6';

export const toggleSidebar = () => {
  if (document.body.classList.contains('hide-sidebar')) {
    document.body.classList.remove('hide-sidebar');
  } else {
    document.body.classList.add('hide-sidebar');
  }
};

export interface HeaderProps {
  withSidebar?: boolean;
}

const Header: React.FC<HeaderProps> = ({ withSidebar = true }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = async () => {
    // bypass the api call
    dispatch(adminLogout());
    navigate(Routing.Login);

    // original api call
    // await accountService
    //   .logout()
    //   .then(async () => {
    //     dispatch(adminLogout());
    //     navigate(Routing.Login);
    //   })
    //   .catch((error: Error) => console.log(error?.message));
  };

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [openMobileSubmenus, setOpenMobileSubmenus] = React.useState<Record<string, boolean>>({});

  const toggleMobileSubmenu = (module: string) => {
    setOpenMobileSubmenus((prev) => {
      const isCurrentlyOpen = !!prev[module];
      return isCurrentlyOpen ? {} : { [module]: true };
    });
  };

  React.useEffect(() => {
    setIsMenuOpen(false);
    const activeParent = sidebarRoutes.find((route) =>
      route.childs?.some((child) => location.pathname === child.route)
    );
    if (activeParent) {
      setOpenMobileSubmenus({ [activeParent.module]: true });
    } else {
      setOpenMobileSubmenus({});
    }
  }, [location.pathname]);

  React.useEffect(() => {
    if (withSidebar) {
      if (window.innerWidth <= 991) {
        document.body.classList.add('hide-sidebar');
      }

      function checkWindowSize() {
        if (window.innerWidth <= 991) {
          document.body.classList.add('hide-sidebar');
        } else {
          document.body.classList.remove('hide-sidebar');
        }
      }

      window.addEventListener('resize', checkWindowSize);
      return () => {
        window.removeEventListener('resize', checkWindowSize);
      };
    }
  }, [withSidebar]);

  const spanBaseClass =
    'block bg-black dark:bg-white w-full h-[0.125rem] rounded-[2px] shadow-[0_0.5px_2px_0_hsla(0,0%,0%,0.2)] transition-colors duration-400 relative';

  return (
    <Navbar
      height="70px"
      position={withSidebar ? 'sticky' : 'static'}
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      maxWidth="full"
      isBordered={withSidebar}
      isBlurred={withSidebar}
      className={
        withSidebar
          ? 'bg-white dark:bg-content1 border-b border-[#7979798a] dark:border-default-100'
          : 'bg-white/90 dark:bg-content1/90 border border-default-200 dark:border-default-800 rounded-2xl shadow-lg shadow-black/5 dark:shadow-black/40 backdrop-blur-md transition-all'
      }
    >
      {/* Left Section */}
      <NavbarContent justify="start">
        {withSidebar ? (
          <NavbarItem>
            <div
              className="sidebar-icon rounded-[5px] cursor-pointer"
              onClick={() => {
                toggleSidebar();
              }}
            >
              <button className="border-none bg-none m-0 cursor-pointer w-[32px] h-[32px] p-1 font-inherit flex flex-col justify-center">
                <span
                  className={`${spanBaseClass} animate-menu-icon-top-2 [.hide-sidebar_&]:animate-menu-icon-top`}
                ></span>
                <span
                  className={`${spanBaseClass} mt-1 animate-menu-icon-scaled-2 [.hide-sidebar_&]:animate-menu-icon-scaled`}
                ></span>
                <span
                  className={`${spanBaseClass} mt-1 animate-menu-icon-bottom-2 [.hide-sidebar_&]:animate-menu-icon-bottom [.hide-sidebar_&]:bg-black dark:[.hide-sidebar_&]:bg-white [.hide-sidebar_&]:mt-[8px]`}
                ></span>
              </button>
            </div>
          </NavbarItem>
        ) : (
          <NavbarBrand as={Link} to="/" className="gap-3">
            <img className="w-9 h-9" src="/favicon.svg" alt="Logo" />
            <span className="text-xl font-bold text-foreground">Admin Portal</span>
          </NavbarBrand>
        )}
      </NavbarContent>

      {/* Center Section: Navigation Links when without Sidebar */}
      {!withSidebar && (
        <NavbarContent justify="center" className="hidden md:flex flex-wrap items-center justify-center gap-x-6 gap-y-1 py-1">
          {sidebarRoutes.map((route: ISidebarData) => {
            const hasChildren = (route.childs?.length ?? 0) > 0;
            const isActive =
              location.pathname === route.route ||
              route.childs?.some((child) => location.pathname === child.route);

            if (hasChildren) {
              return (
                <NavbarItem key={route.module} isActive={isActive}>
                  <Dropdown placement="bottom-start">
                    <DropdownTrigger>
                      <button className={`flex items-center gap-1.5 py-1 text-sm font-medium transition-colors ${isActive ? 'text-primary font-semibold' : 'text-neutral-800 dark:text-neutral-200 hover:text-primary'}`}>
                        {route.icon && <SidebarMenuIcon name={route.icon} className="w-4 h-4" />}
                        <span>{route.name}</span>
                        <FaChevronDown className="w-3 h-3 opacity-70" />
                      </button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label={`${route.name} options`}>
                      {(route.childs || []).map((child) => (
                        <DropdownItem
                          key={child.module}
                          onClick={() => navigate(child.route)}
                          className={location.pathname === child.route ? 'text-primary font-semibold' : ''}
                        >
                          <div className="flex items-center gap-2">
                            {child.icon && <SidebarMenuIcon name={child.icon} className="w-4 h-4" />}
                            <span>{child.name}</span>
                          </div>
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </NavbarItem>
              );
            }

            return (
              <NavbarItem key={route.module} isActive={isActive}>
                <Link
                  to={route.route}
                  className={`flex items-center gap-2 py-1 text-sm font-medium transition-colors ${isActive ? 'text-primary font-semibold' : 'text-neutral-800 dark:text-neutral-200 hover:text-primary'
                    }`}
                >
                  {route.icon && <SidebarMenuIcon name={route.icon} className="w-4 h-4" />}
                  <span>{route.name}</span>
                </Link>
              </NavbarItem>
            );
          })}
        </NavbarContent>
      )}

      {/* Right Section: Controls & Mobile Toggle */}
      <NavbarContent justify="end">
        <NavbarItem>
          <ThemeToggle />
        </NavbarItem>
        <NavbarItem>
          <NotificationsMenu />
        </NavbarItem>
        <NavbarItem>
          <UserMenu onLogout={handleLogoutClick} />
        </NavbarItem>
        {!withSidebar && (
          <NavbarItem className="md:hidden">
            <NavbarMenuToggle
              icon={(isOpen) => (
                <div className="sidebar-icon rounded-[5px] cursor-pointer">
                  <div className="border-none bg-none m-0 cursor-pointer w-[32px] h-[32px] p-1 font-inherit flex flex-col justify-center">
                    <span
                      className={`${spanBaseClass} ${isOpen ? 'animate-menu-icon-top' : 'animate-menu-icon-top-2'}`}
                    ></span>
                    <span
                      className={`${spanBaseClass} mt-1 ${isOpen ? 'animate-menu-icon-scaled' : 'animate-menu-icon-scaled-2'}`}
                    ></span>
                    <span
                      className={`${spanBaseClass} mt-1 ${isOpen ? 'animate-menu-icon-bottom bg-black dark:bg-white mt-[8px]' : 'animate-menu-icon-bottom-2'}`}
                    ></span>
                  </div>
                </div>
              )}
            />
          </NavbarItem>
        )}
      </NavbarContent>

      {/* Mobile Menu Drawer when without Sidebar */}
      {!withSidebar && (
        <NavbarMenu>
          {sidebarRoutes.map((route: ISidebarData) => {
            const hasChildren = (route.childs?.length ?? 0) > 0;
            const isChildActive = route.childs?.some((child) => location.pathname === child.route);
            const isRouteActive = location.pathname === route.route || isChildActive;
            const isOpen = !!openMobileSubmenus[route.module];

            if (hasChildren) {
              return (
                <NavbarMenuItem key={route.module} className="p-0 bg-transparent hover:bg-transparent dark:hover:bg-transparent">
                  <div className="w-full flex flex-col">
                    <button
                      type="button"
                      onClick={() => toggleMobileSubmenu(route.module)}
                      className={`group w-full flex items-center justify-between py-2.5 px-4 rounded-[10px] no-underline transition-colors duration-100 ease-linear ${isRouteActive
                          ? 'bg-primary text-white font-semibold shadow-sm'
                          : 'text-neutral-900 dark:text-neutral-100 hover:bg-primary hover:text-white'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        {route.icon && (
                          <SidebarMenuIcon
                            name={route.icon}
                            className={`w-5 h-5 shrink-0 transition-colors ${isRouteActive ? 'text-white' : 'text-neutral-700 dark:text-neutral-300 group-hover:text-white'
                              }`}
                          />
                        )}
                        <span className="text-[15px] font-medium">{route.name}</span>
                      </div>
                      <FaChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                          } ${isRouteActive ? 'text-white' : 'text-neutral-700 dark:text-neutral-300 group-hover:text-white'}`}
                      />
                    </button>

                    {isOpen && (
                      <div className="pl-4 mt-1 flex flex-col gap-1 border-l-2 border-primary/30 ml-4 py-1">
                        {route.childs?.map((child) => {
                          const isChildSelected = location.pathname === child.route;
                          return (
                            <Link
                              key={child.module}
                              to={child.route}
                              onClick={() => setIsMenuOpen(false)}
                              className={`group/child w-full flex items-center gap-2.5 py-2 px-3 rounded-[8px] text-sm no-underline transition-colors ${isChildSelected
                                  ? 'bg-primary text-white font-semibold shadow-sm'
                                  : 'text-neutral-800 dark:text-neutral-200 hover:bg-primary/10 hover:text-primary dark:hover:text-primary'
                                }`}
                            >
                              {child.icon && (
                                <SidebarMenuIcon
                                  name={child.icon}
                                  className={`w-4 h-4 shrink-0 transition-colors ${isChildSelected ? 'text-white' : 'text-neutral-700 dark:text-neutral-300 group-hover/child:text-primary'
                                    }`}
                                />
                              )}
                              <span className="font-medium">{child.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </NavbarMenuItem>
              );
            }

            return (
              <NavbarMenuItem key={route.module} className="p-0 bg-transparent hover:bg-transparent dark:hover:bg-transparent">
                <Link
                  to={route.route}
                  onClick={() => setIsMenuOpen(false)}
                  className={`group w-full flex items-center gap-3 py-2.5 px-4 rounded-[10px] no-underline transition-colors duration-100 ease-linear ${isRouteActive
                      ? 'bg-primary text-white font-semibold shadow-sm'
                      : 'text-neutral-900 dark:text-neutral-100 hover:bg-primary hover:text-white'
                    }`}
                >
                  {route.icon && (
                    <SidebarMenuIcon
                      name={route.icon}
                      className={`w-5 h-5 shrink-0 transition-colors ${isRouteActive ? 'text-white' : 'text-neutral-700 dark:text-neutral-300 group-hover:text-white'
                        }`}
                    />
                  )}
                  <span className="text-[15px] font-medium">{route.name}</span>
                </Link>
              </NavbarMenuItem>
            );
          })}
        </NavbarMenu>
      )}
    </Navbar>
  );
};

export default Header;
