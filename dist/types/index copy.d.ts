import Axios, { AxiosStatic, AxiosRequestConfig, AxiosResponse, Method } from 'axios';
declare class Api {
    static mockDataList: any[];
    static dataAdapter: any[];
    static paramsList: any[];
    static validate_results: any[];
    static plugins_option: any;
    static validate: any;
    static quote: any;
    static parseQuote(field_item: Param): any;
    static parseMultiValue(field_item: Param): any;
    static paramsToObject(params: Param[]): void;
    static params_validate(value: any, field_obj: Param): boolean;
    static setValidate(name: string, validate: any): void;
    static setQuote(name: string, params: Param[]): void;
    static resetValidate(): void;
    success: any;
    error: any;
    isUseParamsValidate: boolean;
    isUseMock: boolean;
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
    validate_interceptors(config: AxiosRequestConfig): void;
    data_adapter(res: AxiosResponse): any;
    mock_all(flag: any): void;
}
interface mock {
    methods: Method;
    schema: any;
}
declare enum paramsType {
    'string' = "string",
    'number' = "number",
    'boolean' = "boolean",
    'object' = "object"
}
export declare enum type {
    'input' = "input",
    'select' = "select",
    'selectObject' = "selectObject",
    'radio' = "radio",
    'checkbox' = "checkbox",
    'inputNumber' = "inputNumber",
    'cascader' = "cascader",
    'switch' = "switch",
    'slider' = "slider",
    'timePicker' = "timePicker",
    'datePicker' = "datePicker",
    'dateTimePicker' = "dateTimePicker",
    'upload' = "upload",
    'rate' = "rate",
    'colorPicker' = "colorPicker",
    'transfer' = "transfer",
    'list' = "list"
}
interface component {
    type: type;
    options?: any;
    configs?: any;
}
export interface Param {
    key: string;
    require: boolean;
    value?: any;
    type: paramsType;
    isNull: boolean;
    validate: any[];
    label?: string;
    quote?: string;
    options?: any[];
    __key?: string;
    describe?: string;
    isMultiValue?: boolean;
    separator?: string;
    component?: component;
}
interface Params {
    methods: Method;
    params: Param[];
}
export declare class api {
    affix?: string | undefined;
    adapter: any;
    mock: mock[];
    paramsSet: Params[];
    isUseMock: boolean;
    isUseParamsValidate: boolean;
    alreadyMockMethod: Method[];
    alreadyParamsMethod: Method[];
    key: any;
    private route;
    url: string;
    private axios;
    name: string;
    description: string;
    constructor(route: string, route1?: string, route2?: string, route3?: string, route4?: string, otherRoute?: string[]);
    checkArgument(route: any, id?: number | string): any;
    setName(name: string): this;
    setDescription(description: string): this;
    createAffixApi(affix: string): api;
    GET(params?: object, id?: number | string, affix?: string): Promise<AxiosResponse<any, any>>;
    POST(params: object, id?: number | string, affix?: string): Promise<AxiosResponse<any, any>>;
    PUT(params: object, id?: number | string, affix?: string): Promise<AxiosResponse<any, any>>;
    PATCH(params: object, id?: number | string, affix?: string): Promise<AxiosResponse<any, any>>;
    DELETE(id: number | string, affix?: string): Promise<AxiosResponse<any, any>>;
    CUSTOM(config: AxiosRequestConfig | any, id?: number | string, affix?: string): import("axios").AxiosPromise<any>;
    DOWNLOAD(fileName?: string, url?: string): void;
    GET_EXCEL(params: object, id?: number | string): import("axios").AxiosPromise<any>;
    DOWNLOAD_EXCEL(res: any, data?: any): void;
    UPLOAD_IMG(file_list: any): Promise<AxiosResponse<any, any>>;
    combination(urlList: string[]): string;
    setMock(methods: Method, schema: any): void;
    setAdapter(callback: any): void;
    setParams(quote_name: string, methods: Method, params: Param[]): void;
    MockOn(flag: boolean): this;
    getAxios(): AxiosStatic;
}
export { Axios, paramsType };
export default Api;
