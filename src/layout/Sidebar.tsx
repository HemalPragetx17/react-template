import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tooltip } from '../components/ui';
import { Routing } from '../routes/routing';
import type { ISidebarData } from '../shared/constants/sidebar-data';
import { sidebarRoutes } from '../shared/constants/sidebar-data';
import { Modules } from '../shared/enums/modules';
import { SidebarMenuIcon } from '../shared/sidebar-icons';

const Sidebar = () => {
  const { pathname } = useLocation();
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);

  React.useEffect(() => {
    let activeMenu = null;
    if (location?.pathname?.includes(Routing.Settings)) {
      activeMenu = Modules.Settings;
    }
    setActiveMenu(activeMenu);
  }, [location?.pathname]);

  const handleMenuOpen = (menu: string) => {
    if (activeMenu !== menu) {
      setActiveMenu(menu);
    } else {
      setActiveMenu(null);
    }
  };

  const handleMenuClose = () => {
    setActiveMenu(null);
  };

  const menuIconClass = (isActiveRoute: boolean, hoverGroup = 'group') =>
    `w-5 h-5 shrink-0 transition-colors duration-200 ${isActiveRoute
      ? 'text-white'
      : `text-default-600 ${hoverGroup === 'group' ? 'group-hover:text-white' : 'group-hover/child:text-white'}`
    }`;
  
  const childMenuIconClass = (isActiveRoute: boolean, hoverGroup = 'group') =>
    `w-4 h-4 shrink-0 transition-colors duration-200 ${isActiveRoute
      ? 'text-white'
      : `text-default-600 ${hoverGroup === 'group' ? 'group-hover:text-white' : 'group-hover/child:text-white'}`
    }`;

  return (
    <div className='w-[250px] !important h-screen fixed top-0 left-0 flex flex-col overflow-hidden transition-all duration-300 ease-linear [.hide-sidebar_&]:w-[64px] bg-black dark:border-r dark:border-content2'>
      <div className="sticky top-0 z-20 shrink-0 h-[70px] flex justify-start items-center gap-[15px] border-b border-content3 bg-black text-white transition-all duration-300 ease-linear [.hide-sidebar_&]:px-[5px] [.hide-sidebar_&]:w-full [.hide-sidebar_&]:justify-center [.hide-sidebar_&]:gap-0">
        <img className="w-[55px] h-[55px]" src="/favicon.svg" alt='img not found' />
        <p className='text-2xl [.hide-sidebar_&]:hidden'>Admin Portal</p>
      </div>

      <nav className="flex-1 w-full px-[10px] flex flex-col items-start overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-4" tabIndex={-1}
        onFocus={(e) => e.preventDefault()}>
        <ul className='flex flex-col w-full m-0 p-0 list-none'>
          {sidebarRoutes?.map((menu: ISidebarData, index) => {
            const isActive = activeMenu === menu?.module;
            return (
              <li
                key={index}
                className={`mt-2 block p-0 w-full overflow-hidden transition-all duration-500 ease-in-out rounded-[10px] aria-[label=true]:max-h-[400px] aria-[label=false]:max-h-[35px]`}
                aria-label={isActive ? 'true' : 'false'}
                tabIndex={-1}
                onFocus={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  (menu?.childs?.length ?? 0) > 0 ? handleMenuOpen(menu?.module) : handleMenuClose();
                }}
              >
                <Tooltip
                  placement="right"
                  color="primary"
                  showArrow
                  offset={19}
                  radius="md"
                  triggerClassName="w-full"
                  className="hidden [.hide-sidebar_&]:block"
                  content={menu?.name}
                >
                  <Link
                    className={`group w-full relative flex items-center box-border text-[15px] leading-[19px] py-2 px-[14px] gap-[10px] no-underline ${isActive || pathname?.includes(menu?.route) ? 'active bg-primary ' : ''} hover:bg-primary text-white transition-colors duration-100 ease-linear [.hide-sidebar_&]:justify-center [.hide-sidebar_&]:px-0`}
                    to={menu?.route ? menu?.route : '/'}
                    onClick={(e) => {
                      if ((menu?.childs?.length ?? 0) > 0) e.preventDefault();
                    }}
                    tabIndex={-1}
                    onFocus={(e) => e.preventDefault()}
                    aria-label={isActive ? 'true' : 'false'}
                  >
                    {menu?.icon && (
                      <SidebarMenuIcon
                        name={menu.icon}
                        className={`${menuIconClass(isActive || pathname?.includes(menu?.route))} mr-[7px] [.hide-sidebar_&]:mr-0`}
                      />
                    )}
                    <span className="text-[16px] font-medium inline-block mr-[8px] [.hide-sidebar_&]:hidden">{menu?.name}</span>
                    {(menu?.childs?.length ?? 0) > 0 && (
                      <span className={`w-[13px] h-[13px] inline-block relative -bottom-[5px] -left-[10px] transition-all duration-500 ease-in-out mt-[2px] text-left transform rotate-45 ml-auto before:absolute before:content-[''] before:inline-block before:w-[10.5px] before:h-[2.5px] before:bg-default-600 before:transition-all before:duration-500 before:ease-in-out before:rounded-[2px] after:absolute after:content-[''] after:inline-block after:w-[10.5px] after:h-[2.5px] after:bg-default-600 after:transition-all after:duration-500 after:ease-in-out after:rounded-[2px] after:transform after:rotate-90 after:-top-[5px] after:left-[5px] aria-[label=true]:before:-rotate-90 aria-[label=true]:after:rotate-180 group-hover:before:bg-white group-hover:after:bg-white ${isActive || pathname?.includes(menu?.route) ? 'before:bg-white after:bg-white' : ''} [.hide-sidebar_&]:hidden`} aria-label={isActive ? 'true' : 'false'}></span>
                    )}
                  </Link>
                </Tooltip>
                {(menu?.childs?.length ?? 0) > 0 &&
                  (
                    <ul className={`flex flex-col gap-[5px] p-[5px] border-2 border-primary rounded-b-[10px] ${isActive ? 'show-child-menu' : ''}`} tabIndex={-1}
                      onFocus={(e) => e.preventDefault()}>
                      {(menu?.childs?.length ?? 0) > 0 && (
                        menu?.childs?.map((childMenu: ISidebarData, index) => (
                          <li
                            className={`w-full flex items-center gap-[10px] overflow-hidden ${(childMenu?.childs?.length ?? 0) > 0 ? 'has-menu' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            tabIndex={-1}
                            onFocus={(e) => e.preventDefault()}
                            key={index}
                          >
                            <Tooltip
                              placement="right"
                              color="primary"
                              showArrow
                              offset={24}
                              radius="md"
                              triggerClassName="w-full"
                              className="hidden [.hide-sidebar_&]:block"
                              content={childMenu?.name}
                            >
                              <Link
                                className={`group/child w-full relative flex items-center box-border text-[15px] leading-[19px] py-2 px-[10px] rounded-[10px] gap-[10px] no-underline ${pathname?.includes(childMenu?.route) ? 'active bg-primary' : ''} hover:bg-primary text-white transition-colors duration-100 ease-linear [.hide-sidebar_&]:justify-center [.hide-sidebar_&]:px-0`}
                                to={childMenu?.route ? childMenu?.route : '/'}
                                onClick={(e) => {
                                  if ((childMenu?.childs?.length ?? 0) > 0) e.preventDefault();
                                }}
                                tabIndex={-1}
                                onFocus={(e) => e.preventDefault()}
                              >
                                {childMenu?.icon && (
                                  <SidebarMenuIcon
                                    name={childMenu.icon}
                                    className={`${childMenuIconClass(pathname?.includes(childMenu?.route), 'group/child')} mr-[5px] [.hide-sidebar_&]:mr-0`}
                                  />
                                )}
                                <span className="text-[16px] inline-block mr-[8px] [.hide-sidebar_&]:hidden">{childMenu?.name}</span>
                              </Link>
                            </Tooltip>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar