import type { IBaseCreateRequest, IBaseUpdateRequest } from "../base-type";

export interface IUserModal extends IBaseCreateRequest, IBaseUpdateRequest {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneCountry?: string;
    phone?: string;
    userType?: number;
    role?: number;
    active?: boolean;
}

export interface IUserStatusModal {
    status: boolean;
}