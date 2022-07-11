import Axios, { AxiosStatic, AxiosRequestConfig, AxiosResponse, AxiosError, Method } from 'axios';
import { assign } from 'lodash';
import LocalService from 'localservicejs'

interface response_interceptors {
    success(response: AxiosResponse): any,
    error(error: AxiosError, response: AxiosResponse): any
}
interface request_interceptors {
    success(config: AxiosRequestConfig): any,
    error(error: AxiosError): any
}

interface mock {
    methods: Method;
    schema: any;
}

export class Api {
    static mockDataList: any[] = [];
    static dataAdapter: any[] = [];
    static paramsList: any[] = [];
    static validate_results: any[] = [];
    static plugins_option: any = {
        show: false
    }
    
    success: any;
    error: any;
    isUseMock: boolean = false;
    baseurl!: string;
    mockSchema?: object;
    describe?: string;

    private config!: AxiosRequestConfig;
    private request_interceptor: request_interceptors = {
        success(config) { },
        error(err) { },
    }
    private response_interceptor: response_interceptors = {
        success(config) { },
        error(err, response) { },
    }
    constructor(baseurl: string) {
        this.baseurl = baseurl; // baseurl只到端口号，不包含端口号后的位置
        Axios.defaults.baseURL = baseurl;
    }

    createApi(config?: AxiosRequestConfig) {
        this.startInterceptor()
        this.config = JSON.parse(JSON.stringify(config)) || {};
        return api
    }
    setRequestInterceptors(success: any, error: any) {
        this.request_interceptor.success = success;
        this.request_interceptor.error = error;
    }
    setResponseInterceptors(success: any, error: any) {
        this.response_interceptor.success = success;
        this.response_interceptor.error = error;
    }

    startInterceptor() {
        Axios.interceptors.request.use((config: AxiosRequestConfig) => {
            config = assign(config, this.config)
            config = Object.assign(config, this.request_interceptor.success.call(this, config) || {})
            // tslint:disable-next-line: no-unused-expression
            this.isUseMock && (config = Object.assign(config, this.mock_interceptors(config) || {}))
            Api.plugins_option.show = true;
            return config
        }, (err: any) => {
            err = Object.assign(err, this.request_interceptor.error.call(this, err) || err)
            Api.plugins_option.show = false
            console.log(err)
            return Promise.reject(err)
        })
        Axios.interceptors.response.use((res: AxiosResponse) => {
            res = Object.assign(res, this.data_adapter(res))  // 开发时，我们只需要按照前端的需求来开发，如果数据不符合我们的期待，就可以通过添加适配器来转换数据，而不需要变更页面逻辑
            res = Object.assign(res, this.response_interceptor.success.call(this, res) || {});
            Api.plugins_option.show = false
            return res
        }, (err: AxiosError) => {
            // 不能够直接传入Error对象,必须先JSON化处理
            // 处理后的Error对象将不会保留非默认的字段
            err = Object.assign(err, this.response_interceptor.error(JSON.parse(JSON.stringify(err)), err.response as AxiosResponse))

            Api.plugins_option.show = false
            return Promise.reject(err)
        })
    }
    mock_interceptors(config: AxiosRequestConfig) {
        for (const i of Api.mockDataList) {
            if ((i.isUseMock && this.isUseMock) && config.method && config.url && (i.affix ? config.url.match(`${i.route}\\d+/${i.affix}`) : config.url === i.url) && i.alreadyMockMethod.indexOf(config.method.toLocaleUpperCase()) !== -1) {
                const index = i.alreadyMockMethod.indexOf(config.method.toLocaleUpperCase())
                if (index != -1) {
                    let str = i.route + `.*${i.affix ? '/' + i.affix + '/' : ''}`
                    LocalService.listener(new RegExp(str) as any, config.method, i.mock[index].schema)
                    console
                        .warn(`[LocalService request]method:${i.mock[index].methods}&&url:${i.route}`)
                }
            }
        }
        return config
    }

    data_adapter(res: AxiosResponse) {
        for (const i of Api.dataAdapter) {
            // dataAdapter目前只支持转换get请求的返回数据，其他的暂时没有必要
            if (res.config.url === i.url || new RegExp(`${i.route}\\d+/${i.affix}/`).test(res.config.url as string)) {
                if (i.adapter) {
                    return i.adapter(res)
                }
            }
        }
        return res
    }
    mock_all(flag: any) {
        // tslint:disable-next-line: no-unused-expression
        flag && console.warn(`warning: method mock_all of Api is turn on, that any request to server `)
        this.isUseMock = flag;
    }
}
export class api {
    affix?: string | undefined;
    adapter: any = null;
    mock: mock[] = []
    isUseMock: boolean = false;
    isUseParamsValidate: boolean = true;  // 如无必要不要开启，复杂表单可能有性能问题
    alreadyMockMethod: Method[] = [];
    alreadyParamsMethod: Method[] = [];
    key: any;
    private route!: string;
    url!: string;
    private axios: AxiosStatic = Axios;
    name!: string;
    description!: string;

    constructor(route: string, route1?: string, route2?: string, route3?: string, route4?: string, otherRoute?: string[]) {
        // scope与route后都不需要带/,有函数自动判断并添加
        const route_list = [route, route1, route2, route3, route4].concat(otherRoute)
        this.url = this.combination(route_list as string[]);
        this.route = this.url.split('#')[0]
        this.affix = this.url.split('#')[1] && this.url.split('#')[1].slice(1, -1) || '';
    }

    checkArgument(route: any, id?: number | string) {
        const match = this.url.match('#')
        if (match) {
            if (id !== 0 && !id) {
                throw new Error(`${this.url} 调用时必须传入id`)
            }
        } else {
            return route
        }
    }
    setName(name: string) {
        this.name = name;
        return this;
    }
    setDescription(description: string) {
        this.description = description;
        return this
    }

    createAffixApi(affix: string) {
        return new api(this.route, '#', affix)
    }
    GET(params: object = {}, id?: number | string, affix?: string) {
        return this.axios.get(`${this.checkArgument(this.route, id)}${id ? id + '/' : ''}${affix ? affix + '/' : this.affix ? this.affix + '/' : ''}`, { params })
    }
    POST(params: object, id?: number | string, affix?: string) {
        return this.axios.post(`${this.checkArgument(this.route)}${id ? id + '/' : ''}${affix ? affix + '/' : this.affix ? this.affix + '/' : ''}`, params)
    }
    PUT(params: object, id?: number | string, affix?: string) {
        return this.axios.put(`${this.checkArgument(this.route)}${id ? id + '/' : ''}${id ? id + '/' : ''}${affix ? affix + '/' : this.affix ? this.affix + '/' : ''}`, params)
    }
    PATCH(params: object, id?: number | string, affix?: string) {
        return this.axios.patch(`${this.checkArgument(this.route)}${id ? id + '/' : ''}${id ? id + '/' : ''}${affix ? affix + '/' : this.affix ? this.affix + '/' : ''}`, params)
    }
    DELETE(id: number | string, affix?: string) {
        return this.axios.delete(`${this.checkArgument(this.route)}${id ? id + '/' : ''}${id ? id + '/' : ''}${affix ? affix + '/' : this.affix ? this.affix + '/' : ''}`)
    }
    CUSTOM(config: AxiosRequestConfig | any, id?: number | string, affix?: string) {
        return this.axios(Object.assign({ url: `${this.checkArgument(this.route)}${id ? id + '/' : ''}${id ? id + '/' : ''}${affix ? affix + '/' : this.affix ? this.affix + '/' : ''}` }, config))
    }

    DOWNLOAD(fileName: string = 'donwload', url?: string) {
        const link = document.createElement('a')
        link.style.display = 'none';
        link.setAttribute('href', url || this.route);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click()
    }
    GET_EXCEL(params: object, id?: number | string) {
        return this.CUSTOM(Object.assign({
            method: 'get',
            responseType: 'blob'
        }, { params }) as AxiosRequestConfig, id)
    }
    DOWNLOAD_EXCEL(res: any, data?: any) {
        const fileName = res.headers['content-disposition']
            .split(';')[1]
            .split('filename=')[1]
            .replace('"', '')
            .replace('"', '');

        const url = window.URL.createObjectURL(
            new Blob([data ? data : res.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8',
            })
        );
        this.DOWNLOAD(fileName, url)
    }
    UPLOAD_IMG(file_list:any){
        //只能上传图片，传入一个originFileObj[]
        let formData = new FormData()
        file_list.forEach((item:any) => {
            formData.append('file', item.originFileObj);
        });
        return this.POST(formData)
    }
    combination(urlList: string[]): string {
        let url!: string;
        urlList = urlList.filter((item: any) => item)
        urlList.push('')
        if (!urlList[0].match(/^http|^https/i)) {
            urlList.unshift(Axios.defaults.baseURL as string)
        }
        if (urlList[0].match(/\/$/i)) {
            urlList[0] = urlList[0].slice(0, urlList[0].length - 1)
        }
        url = urlList.join('/')
        if (urlList[urlList.length - 2].indexOf('.') != -1) {
            // 防止资源类的api在最后加上/
            url = url.substring(0, url.length - 1)
        }
        return url
    }

    setMock(methods: Method, schema: any) {
        this.mock.push({ methods, schema });
        if (this.alreadyMockMethod.indexOf(methods) !== -1) {
            throw Error(`${this.name ? this.name : this.url}，Api定义了重复的Method, 确保该api的每种method只设置了一个mock数据`)
        } else {
            this.alreadyMockMethod.push(methods)
        }
        this.isUseMock = true;
        Api.mockDataList.push(this)
    }

    setAdapter(callback: any) {
        this.adapter = callback;
        Api.dataAdapter.push(this)
    }

    MockOn(flag: boolean) {
        this.isUseMock = flag;
        return this
    }
    getAxios() {
        return this.axios
    }

}