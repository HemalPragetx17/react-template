/* eslint-disable import/no-anonymous-default-export */
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import messages from "../shared/constants/messages";
import { HttpStatusCode } from "../shared/enums/http-status-code";
import { adminLogout, updateTokens } from "../store/slices/authSlice";
import type { IApplicationState } from "../store/state/app-state";
import store from "../store/store";
import { getBaseURL } from "../utils/commonFunctions";
import { Routing } from "../routes/routing";
import { refreshAccessToken } from "./refresh-access-token";

interface AxiosErrors {
    message?: string;
    code?: string;
    config?: RetryableRequestConfig;
    request?: any;
    response?: AxiosResponse;
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

interface QueueItem {
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else if (token) {
            promise.resolve(token);
        }
    });
    failedQueue = [];
};

const isRefreshTokenRequest = (url?: string) =>
    !!url && url.includes("auth/refresh-token");

axios.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const storeData: IApplicationState = store?.getState();
        const isRefreshRequest = isRefreshTokenRequest(config.url);
        const authToken = isRefreshRequest
            ? storeData?.UserData?.refreshToken
            : storeData?.UserData?.accessToken;
        const token = authToken ? `Bearer ${authToken}` : "";
        const baseURL = import.meta.env.VITE_BASE_URL || "";
        const apiBaseURL = getBaseURL(baseURL);

        if (config.url && !config.url.startsWith("http") && !config.url.startsWith(apiBaseURL)) {
            config.url = apiBaseURL + config.url;
        }

        config.headers = config.headers ?? {};
        if (token) {
            config.headers.Authorization = token;
        }
        config.headers["ngrok-skip-browser-warning"] = "69420";

        return config;
    },
    (error: AxiosError) => {
        switch (error?.response?.status) {
            case HttpStatusCode.BadRequest:
            case HttpStatusCode.ConflictError:
            case HttpStatusCode.InternalServerError:
                toast.error(messages.InternalServerError);
                return Promise.reject(error);
        }
        return Promise.reject(messages.SomethingWentWrong);
    }
);

axios.interceptors.response.use(
    (response: AxiosResponse) => {
        if (response.config.responseType !== "blob" && !response?.data?.success) {
            toast.error(response?.data?.message);
        }
        return response;
    },
    async (error: AxiosErrors) => {
        const originalRequest = error.config;

        switch (error.response?.status) {
            case HttpStatusCode.BadRequest:
                toast.error(error?.response?.data?.message);
                return Promise.reject(error);
            case HttpStatusCode.ConflictError:
                toast.error(error?.response?.data?.message);
                return Promise.reject(error);
            case HttpStatusCode.InternalServerError:
                toast.error(error?.response?.data?.message);
                return Promise.reject(error);
            case HttpStatusCode.Unauthorized: {
                if (
                    !originalRequest ||
                    isRefreshTokenRequest(originalRequest.url) ||
                    originalRequest._retry
                ) {
                    if (!isRefreshTokenRequest(originalRequest?.url)) {
                        toast.error(error?.response?.data?.message);
                    }
                    store.dispatch(adminLogout());
                    window.location.reload();
                    return Promise.reject(error);
                }

                const storeData: IApplicationState = store.getState();
                const currentRefreshToken = storeData?.UserData?.refreshToken;

                if (!currentRefreshToken) {
                    toast.error(error?.response?.data?.message);
                    store.dispatch(adminLogout());
                    window.location.reload();
                    return Promise.reject(error);
                }

                if (isRefreshing) {
                    return new Promise<string>((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then((accessToken) => {
                        originalRequest.headers = originalRequest.headers ?? {};
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                        return axios(originalRequest);
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                return refreshAccessToken()
                    .then((newAccessToken) => {
                        store.dispatch(updateTokens(newAccessToken));
                        processQueue(null, newAccessToken);

                        originalRequest.headers = originalRequest.headers ?? {};
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return axios(originalRequest);
                    })
                    .catch((refreshError: any) => {
                        processQueue(refreshError, null);
                        toast.error(
                            refreshError?.response?.data?.message ||
                            refreshError?.data?.message ||
                            messages.SomethingWentWrong
                        );
                        store.dispatch(adminLogout());
                        window.location.reload();
                        return Promise.reject(refreshError);
                    })
                    .finally(() => {
                        isRefreshing = false;
                    });
            }
            case HttpStatusCode.Forbidden:
                toast.error(error?.response?.data?.message);
                store.dispatch(adminLogout());
                window.location.reload();
                return Promise.reject(error);
            case HttpStatusCode.NotFound:
                toast.error(error?.response?.data?.message);
                window.location.href = Routing.NotFound;
                return Promise.reject(error);
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
