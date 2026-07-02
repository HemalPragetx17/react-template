import React from 'react';

interface IPublicLayoutProps {
    children?: React.ReactNode;
}

const PublicLayout: React.FC<IPublicLayoutProps> = ({ children }) => {
    return <>{children}</>;
};

export default PublicLayout;
