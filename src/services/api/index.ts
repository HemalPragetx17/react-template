export interface ApiResponseModel<T = any> {
    message: string;
    data: T;
    success: boolean;
    statusCode: number;
}
