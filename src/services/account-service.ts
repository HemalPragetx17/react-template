/* eslint-disable import/no-anonymous-default-export */
import type { AxiosResponse } from "axios";
import type {
    IForgotPasswordEmailModel,
    IForgotPasswordOTPModel,
    IForgotPasswordPasswordModel,
    ILoginRequestModel,
    ILoginResponseModel,
} from "../models/account";
import type { IRoutesModel } from "../models/routes";
import type { ApiResponseModel } from "./api";
import httpService from "./http-service";

const endPointBaseURL = `admin`;

const login = async (requestBody: ILoginRequestModel): Promise<AxiosResponse<ILoginResponseModel>> =>
    httpService.post<ILoginResponseModel>(`${endPointBaseURL}/login`, requestBody);

const logout = async (): Promise<AxiosResponse<boolean>> => httpService.post<boolean>(`${endPointBaseURL}/logout`, {});

const readPermission = async (): Promise<AxiosResponse<ApiResponseModel<Array<IRoutesModel>>>> =>
    httpService.get<ApiResponseModel<Array<IRoutesModel>>>(`${endPointBaseURL}/readPermission`);

const forgotPassword = async (requestBody: IForgotPasswordEmailModel): Promise<AxiosResponse<ApiResponseModel<ILoginResponseModel>>> =>
    httpService.post<ApiResponseModel<ILoginResponseModel>>(`forgot_password/`, requestBody);

const varifyOTP = async (requestBody: IForgotPasswordOTPModel): Promise<AxiosResponse<ApiResponseModel<ILoginResponseModel>>> =>
    httpService.post<ApiResponseModel<ILoginResponseModel>>(`verify_otp/`, requestBody);

const resendOTP = async (): Promise<AxiosResponse<ApiResponseModel<ILoginResponseModel>>> =>
    httpService.get<ApiResponseModel<ILoginResponseModel>>(`resend_otp/`);

const resetPassword = async (requestBody: IForgotPasswordPasswordModel): Promise<AxiosResponse<ApiResponseModel<ILoginResponseModel>>> =>
    httpService.post<ApiResponseModel<ILoginResponseModel>>(`${endPointBaseURL}/resetPassword`, requestBody);


export default {
    login,
    logout,
    readPermission,
    forgotPassword,
    varifyOTP,
    resendOTP,
    resetPassword
};
