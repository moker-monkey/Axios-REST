import { AxiosStatic, AxiosRequestConfig, AxiosResponse, Method } from 'axios';
interface service {
    methods: Method;
    service: any;
}
export declare class Api {
    static mockDataList: any[];
    static listenerList: any[];
    static dataAdapter: any[];
    static paramsList: any[];
    static validate_results: any[];
    static plugins_option: any;
    static api_id: number;
    success: any;
    error: any;
    isLocalService: boolean;
    baseurl: string;
    mockSchema?: object;
    describe?: string;
    private config;
    private request_interceptor;
    private response_interceptor;
    constructor(baseurl: string);
    createApi(config?: AxiosRequestConfig): typeof api;
    setRequestInterceptors(success: any, error: any): void;
    setResponseInterceptors(success: any, error: any): void;
    startInterceptor(): void;
    mock_interceptors(config: AxiosRequestConfig): AxiosRequestConfig<any>;
    data_adapter(res: AxiosResponse): any;
    local_service_on(flag: any): void;
}
export declare class api {
    affix?: string | undefined;
    adapter: any;
    service: service[];
    isLocalService: boolean;
    isUseParamsValidate: boolean;
    alreadyMockMethod: Method[];
    alreadyParamsMethod: Method[];
    key: any;
    private route;
    url: string;
    private axios;
    name: string;
    description: string;
    webworkerInstance?: any;
    api_id: number;
    constructor(route: string, route1?: string, route2?: string, route3?: string, route4?: string, otherRoute?: string[]);
    checkArgument(route: any, id?: number | string): any;
    setName(name: string): this;
    setDescription(description: string): this;
    createAffixApi(affix: string): api;
    GET(params?: object, id?: number | string, affix?: string): Promise<AxiosResponse<any, any>>;
    POST(params?: object, id?: number | string, affix?: string): Promise<AxiosResponse<any, any>>;
    PUT(params?: object, id?: number | string, affix?: string): Promise<AxiosResponse<any, any>>;
    PATCH(params?: object, id?: number | string, affix?: string): Promise<AxiosResponse<any, any>>;
    DELETE(id: number | string, affix?: string): Promise<AxiosResponse<any, any>>;
    CUSTOM(config: AxiosRequestConfig | any, id?: number | string, affix?: string): import("axios").AxiosPromise<any>;
    DOWNLOAD(fileName?: string, url?: string): void;
    GET_EXCEL(params: object, id?: number | string): import("axios").AxiosPromise<any>;
    DOWNLOAD_EXCEL(res: any, data?: any): void;
    UPLOAD_IMG(file_list: any): Promise<AxiosResponse<any, any>>;
    combination(urlList: string[]): string;
    setService(methods: Method, service: any): void;
    setWebworker(f: () => void): void;
    GET_WORKER(params: any): any;
    setAdapter(callback: any): void;
    local_service_on(flag: boolean): this;
    getAxios(): AxiosStatic;
    listenerMap: any;
    listener(name: string, cb: (data: any, getter: any) => void): this;
    dispatch(name: string, data: any, getter_cb: any): void;
    rmListener(key: number): void;
}
export {};
