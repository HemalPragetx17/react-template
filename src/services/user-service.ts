/* eslint-disable import/no-anonymous-default-export */
import type { AxiosResponse } from "axios";
import type { IAppointmentListResponse } from "../models/appointment";
import type { IUserModal, IUserStatusModal } from "../models/user";
import { buildQueryParams } from "../utils/commonFunctions";
import type { ApiResponseModel } from "./api";
import httpService from "./http-service";

const endPointBaseURL = `admin`;

const getAllUsers = async (params: Record<string, any>): Promise<AxiosResponse<ApiResponseModel<Array<IUserModal>>>> =>
    httpService.get<ApiResponseModel<Array<IUserModal>>>(`${endPointBaseURL}/hcp/list${buildQueryParams(params)}`);

const getAllAppointments = async (params: Record<string, any>): Promise<IAppointmentListResponse> => {
    const response = await httpService.get(`${endPointBaseURL}/appointment-list${buildQueryParams(params)}`);
    return response as unknown as IAppointmentListResponse;
};

const addUser = async (requestBody: IUserModal): Promise<AxiosResponse<ApiResponseModel<boolean>>> =>
    httpService.post<ApiResponseModel<boolean>>(`${endPointBaseURL}/addHcp`, requestBody);

const toggleUserStatus = async (userId: string, payload: IUserStatusModal): Promise<AxiosResponse<ApiResponseModel<boolean>>> =>
    httpService.post<ApiResponseModel<boolean>>(`${endPointBaseURL}/hcp/approve/${userId}`, payload);

export default {
    getAllUsers,
    getAllAppointments,
    addUser,
    toggleUserStatus,
};
