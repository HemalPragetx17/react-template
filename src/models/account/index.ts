export interface ILoginRequestModel {
    email: string;
    password: string;
}

export interface ILoginResponseModel {
    accessToken: string;
    refreshToken: string;
    user: {
        _id: string;
        email?: string;
        phone?: string;
        role?: string;
        isActive?: boolean;
        firstName: string;
        lastName: string;
    }
}

export interface IChangePasswordModel {
    oldPassword: string;
    password: string;
    confirmPassword: string;
}

export interface IForgotPasswordEmailModel {
    email: string;
}

export interface IForgotPasswordOTPModel {
    otp: string;
}

export interface IForgotPasswordPasswordModel {
    password: string;
    confirmPassword: string;
}

export interface IRefreshTokenResponseModel {
    accessToken: string;
}