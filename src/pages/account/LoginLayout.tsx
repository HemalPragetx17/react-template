import React from 'react';
import Login from './Login';
import LoginTwoColumn from './LoginTwoColumn';

export interface LoginLayoutProps {
  variant?: 'single-column' | 'two-column';
}

const LoginLayout: React.FC<LoginLayoutProps> = ({ variant = 'single-column' }) => {
  if (variant === 'two-column') {
    return <LoginTwoColumn />;
  }
  
  return <Login />;
};

export default LoginLayout;
