export interface IApplicationState {
    UserData: IAuthState;
    GeneralData: IGeneralState;
}

export interface IAuthState {
    id: string;
    email: string;
    phone: string;
    role: string;
    token: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
}


export interface IGeneralState {
    tableLoading: boolean;
    formLoading: boolean;
    progressLoading: boolean;
}
