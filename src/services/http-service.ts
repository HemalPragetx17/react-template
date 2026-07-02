/* eslint-disable import/no-anonymous-default-export */
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import messages from "../shared/constants/messages";
import { HttpStatusCode } from "../shared/enums/http-status-code";
import { adminLogout } from "../store/slices/authSlice";
import type { IApplicationState } from "../store/state/app-state";
import store from "../store/store";
import { getBaseURL } from "../utils/commonFunctions";

interface AxiosErrors {
    message?: string,
    code?: string,
    config?: InternalAxiosRequestConfig,
    request?: any,
    response?: AxiosResponse,
}

axios.interceptors.request.use(
    (config: any) => {
        const storeData: IApplicationState = store?.getState();
        let token = null;
        token = `Bearer ${storeData?.UserData?.token}`;

        if (config.url) {
            const baseURL = import.meta.env.VITE_BASE_URL || "";
            config.url = getBaseURL(baseURL) + config.url;
        }
        config.headers = {
            ...config.headers,
            Authorization: token,
            "ngrok-skip-browser-warning": "69420",
        };

        return config;
    },
    (error: AxiosError) => {
        switch (error?.response?.status) {
            case HttpStatusCode.BadRequest:
            case HttpStatusCode.ConflictError:
            case HttpStatusCode.InternalServerError:
                toast.error(messages.InternalServerError);
                return;
        }
        return Promise.reject(messages.SomethingWentWrong);
    }
);

axios.interceptors.response.use(
    (response: AxiosResponse) => {
        // if (!response?.data?.status) {
        //     toast.error(response?.data?.message);
        // }
        return response?.data;
    },
    (error: AxiosErrors) => {
        switch (error.response?.status) {
            case HttpStatusCode.BadRequest:
                toast.error(error?.response?.data?.error);
                return;
            case HttpStatusCode.ConflictError:
                toast.error(error?.response?.data?.error);
                return;
            case HttpStatusCode.InternalServerError:
                toast.error(error?.response?.data?.error);
                return;
            case HttpStatusCode.Unauthorized:
                toast.error(error?.response?.data?.error);
                store.dispatch(adminLogout());
                return;
            case HttpStatusCode.Forbidden:
                toast.error(error?.response?.data?.error);
                store.dispatch(adminLogout());
                return;
            case HttpStatusCode.NotFound:
                toast.error(error?.response?.data?.error);
                store.dispatch(adminLogout());
                return;
        }

        return Promise.reject(messages.SomethingWentWrong);
    }
);

export default {
    get: axios.get,
    post: axios.post,
    put: axios.put,
    delete: axios.delete,
    patch: axios.patch,
};
