import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { Api } from '../../../src'

const _Api = new Api('https://baidu.com')

_Api.setRequestInterceptors((_config: AxiosRequestConfig) => {
    return _config
}, (err: AxiosError) => {
    return Promise.reject(err)
})

_Api.setResponseInterceptors((_config: AxiosRequestConfig) => {
    // 请求成功拦截器
    return _config
}, (err: AxiosError, response: AxiosResponse) => {
    // 请求错误拦截器
    if (response.status === 401) {
        if (document.location.href.match(new RegExp('login', 'img')))
            //如果为401则不报错,因为在输错密码之后不需要重新跳转
            return
    }
    err.response = response //在err拦截器中必须要重新赋值response，否则后面的catch里的err取不到response
    return err
})

_Api.local_service_on(true) //开启所有的本地服务,本地服务的优先级低于单一api的local_service_on
const api = _Api.createApi({})

export const getMenu = new api('core', 'menu')
export const net_get = new api('api', 'get')
net_get.listener((data) => { console.log(data.hello) })

