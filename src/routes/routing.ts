const PATH_PREFIX = import.meta.env.VITE_PATH_PREFIX;

export const Routing = {
  Login: `${PATH_PREFIX}/login`,
  ForgotPassword: `${PATH_PREFIX}/forgot-password`,

  Dashboard: `${PATH_PREFIX}/dashboard`,
  DemoFormPage: `${PATH_PREFIX}/dashboard/demo-form`,
  Users: `${PATH_PREFIX}/users`,
  UserDetails: `${PATH_PREFIX}/users/user-details`,
  Settings: `${PATH_PREFIX}/settings`,
  TermsAndCondition: `${PATH_PREFIX}/settings/terms-and-condition`,
  PrivacyPolicy: `${PATH_PREFIX}/settings/privacy-policy`,
  AppSettings: `${PATH_PREFIX}/settings/app-settings`,
  UIKit: `${PATH_PREFIX}/ui-kit`,

  NotFound: `${PATH_PREFIX}/not-found`,
  ErrorPage: `${PATH_PREFIX}/error`,
};
