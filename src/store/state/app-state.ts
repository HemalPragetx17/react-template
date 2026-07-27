export interface IApplicationState {
    UserData: IAuthState;
    GeneralData: IGeneralState;
}

export interface IAuthState {
    _id: string;
    email: string;
    phone: string;
    role: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    accessToken: string;
    refreshToken: string;
}


export interface IGeneralState {
    tableLoading: boolean;
    formLoading: boolean;
    progressLoading: boolean;
}
