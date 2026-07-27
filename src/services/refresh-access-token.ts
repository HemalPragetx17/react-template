import axios from "axios";
import type { IRefreshTokenResponseModel } from "../models/account";
import store from "../store/store";
import { getBaseURL } from "../utils/commonFunctions";
import type { ApiResponseModel } from "./api";

export const refreshAccessToken = async (): Promise<string> => {
    const refreshToken = store.getState()?.UserData?.refreshToken;

    if (!refreshToken) {
        throw new Error("Missing refresh token");
    }

    const baseURL = import.meta.env.VITE_BASE_URL || "";
    const apiBaseURL = getBaseURL(baseURL);

    const response = await axios.post<ApiResponseModel<IRefreshTokenResponseModel>>(
        `${apiBaseURL}auth/refresh-token`,
        {},
        {
            headers: {
                Authorization: `Bearer ${refreshToken}`,
                "ngrok-skip-browser-warning": "69420",
            },
        },
    );

    const newAccessToken = response?.data?.data?.accessToken;

    if (!response?.data?.success || !newAccessToken) {
        throw response;
    }

    return newAccessToken;
};
