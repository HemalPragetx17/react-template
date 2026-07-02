import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Breadcrumbs } from '../components/ui';

interface IMainLayoutProps {
    children?: React.ReactNode;
    withSidebar?: boolean;
}

const MainLayout: React.FC<IMainLayoutProps> = ({ children, withSidebar = true }) => {
    if (!withSidebar) {
        return (
            <div className="w-full min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden relative">
                <header className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6 lg:px-8 pt-3 pb-2 bg-background/80 backdrop-blur-md transition-all pointer-events-none">
                    <div className="max-w-7xl mx-auto pointer-events-auto">
                        <Header withSidebar={false} />
                    </div>
                </header>
                <main className="main-content flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-6">
                    {/* Comment the line below to hide/disable breadcrumbs throughout the entire system */}
                    <Breadcrumbs variant="light" size="md" color="default" underline="hover" radius="lg" />
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className="flex justify-start overflow-y-scroll relative">
            <Sidebar />
            <div className="flex-grow w-[calc(100%-250px)] [.hide-sidebar_&]:w-[calc(100%-64px)] transition-all duration-300 ease-linear fixed right-0 top-0 h-screen overflow-auto overflow-x-hidden bg-background text-foreground">
                <Header withSidebar={true} />
                <main className="main-content p-5">
                    {/* Comment the line below to hide/disable breadcrumbs throughout the entire system */}
                    <Breadcrumbs variant="light" size="md" color="default" underline="hover" radius="lg" />
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
