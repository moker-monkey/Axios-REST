 # 介绍
（开发中）
Axios-REST是一个无侵入式REST风格的API请求框架，意味着它可以和任何框架共用，该框架是在Axios基础上的封装，其设计的目的是为了使REST风格的API变得易复用、易管理、更轻松的与后端接通，与此同时将一些常用的接口功能封装起来例如：上传、下载；
Axios-REST能够极大简化（获取后端数据-数据转换-传入前端组件）数据传入组件的这一层。

## REST风格
> API接口是一种标准，这是该框架封装的基本原理，通常来说REST风格定义了URL路径合理的设计方式，现在先简单看看Axios-REST所理解的REST风格API应该是怎样的。

### URL设计
首先URL是一种获取资源的地址，因此URL设计的根本是讨论资源的存储与分配规则。
资源是文件，资源存储的地方是文件夹，文件夹是存放在机器上
![image.png](https://cdn.nlark.com/yuque/0/2022/png/26397694/1649744988059-9467876a-50b5-4909-9fb4-2f8918054d50.png#clientId=u0d0b6dd6-ce96-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=167&id=HTXqM&margin=%5Bobject%20Object%5D&name=image.png&originHeight=300&originWidth=450&originalType=binary&ratio=1&rotation=0&showTitle=false&size=62210&status=done&style=none&taskId=uadb46a9d-30cd-486b-985b-15316654600&title=&width=250)
### BaseURL
需不需要在最后加斜杠？
Axios-REST认为，斜杠前面部分是为了找到机器，因此我们的重点是PATH的与QUERY STRING的定义规则
我们一般规定http://sitechecker.pro/这是定位到sitechecker.pro这个机器的根目录，根目录也算做PATH的一部分，因此在配置全局的baseURL时就不必去定义path部分，当然大家的习惯未必一样，因此在框架里兼容了这样的情况。

### Path
![](https://cdn.nlark.com/yuque/0/2022/jpeg/26397694/1649754553393-b26c81aa-15fc-4dc2-8254-3ec2f6fe6464.jpeg)

以一个日志资源的操作的接口为例，这个接口的意思就可以解读为，操作ODMS系统的log模块的ID为12343的日志
简单清晰，接下来解释原因：
通常为了网络安全，我们机器对外只会默认开放80端口来接收外来http请求；
path1：因为只有一个端口，所以需要使用nginx来分发请求，REST风格约定path1是作为分发标识来使用；
path2：通常表示资源类型，例如：获取用户数据user_info，获取商品数据shop_store等；
path3：可以是资源的ID、资源名，为资源的ID则最多有path4，此时path4表示对该资源的一种操作，若为资源名则不应该有path4（例如：/index.html,的**资源名**这是获取静态资源的请求，不应该有path4)；
path4: 对资源的操作；
当然以上都只是一种API定义风格的理解，市面上不同的框架有不同的接口风格，Axios-REST支持任何一种path的定义，但能遵循这样的Path可以是Axios-REST发挥最大功能。

### Methods
GET请求表示了获取资源
POST请求表示创建资源
PUT请求表示修改资源，必须带ID
PATCH请求表示修改资源中的一个字段，必须带ID
DELTE请求表示删除资源，必须带ID
注意：因为修改资源必然需要知道修改那个资源，因此PUT，PATCH，DELETE请求必需要带上资源ID
### Query String
通常我们不会过多的限制queryString，自由度较高，但是比较常见的问题是

1. 传Array，如果是GET请求，一般转换成以逗号分割的字符串。
1. 传Object， 这个场景通常出现在非GET，DELETE请求中，注意不要在Object中嵌套JSON，因为浏览器会先JSON化对象，这会给嵌套在对象中的JSON字符串的引号加上斜杠，导致后端取到之后无法反序列化该JSON数据。
# 快速开始
由于是在Axios之上封装的框架，因此很多用法同Axios相似，类型也能够借鉴Axios类型。
## 定义api

```typescript
import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import Api from "~/components/Axios/AxiosApi";

// 获取全局配置对象API
const Api = new Api('https://localhost:8080')//BaseURL

// 设置通用请求头
const config: AxiosRequestConfig = {
  headers: {
    'Content-type': 'application/json'
  }
}

const api = Api.createApi(config) //获取api类

//https://localhost:8080/local/test/
export let simpleUrl = new api('local', 'test')
//使用资源占位符#
//https://localhost:8080/dbdata/database/1234321/dashboard/table_size
export let complexUrl=new api('dbdata','database','#','dashboard','table_size')

export default Api

```

## 发起请求
```typescript
import  {localTest} from './api'
/*
用于应对：https://localhost:8080/local/test/
*/
simpleUrl.GET({value:'hello'}).then(res=>{})
simpleUrl.POST({value:'hello'}).then(res=>{})
/* 
用于应对：https://localhost:8080/local/test/123432/
*/
let id = '123432'
simpleUrl.PUT({value:'world'},id).then(res=>{})
simpleUrl.PATCH({value:'world'},id).then(res=>{})
simpleUrl.DELETE(id).then(res=>{})
/* 
用于应对：https://localhost:8080/local/test/123432/run_log
*/
let action = 'run_log'
simpleUrl.GET({},id,action).then(res=>{})
simpleUrl.POST({},id,action).then(res=>{})

```
### id占位符号
通常我们会使用标准API，如果没有特殊情况id参数默认会放到链接的最后一位，但是也有一些复杂情况，可以使用占位符号#来替代未来传入的id值
```typescript
import {complexUrl} from './api'

let complexUrl=new api('dbdata','database','#','dashboard','table_size')

// https://localhost:8080/dbdata/database/1234321/dashboard/table_size?value=hello
complexUrl.GET({value:'hello'},'1234321').then(res=>{})
//https://localhost:8080/dbdata/database/1234321/dashboard/table_size
//body:"{value:"hello"}"
complexUrl.POST({value:'hello'},'1234321').then(res=>{})
```
### 下载功能
Axios-REST针对下载场景进行了封装
#### 下载Excel
```typescript
let getExcel= new api('database','excel')
getExcel.GET_EXCEL({page:2}).then(res=>{
  // 如果res.data就是Excel的数据流就这样做
  getExcel.DOWNLOAD_EXCEL(res)
  // 如果res.data.data才是Excel的数据流就这样做,其他情况也如此
  getExcel.DOWNLOAD_EXCEL(res,res.data.data)
  // 下载的文件名有请求头'content-disposition'来控制
})
```
#### A链接下载1
```typescript
let getSomeLink= new api('database','download')

<div onclick="getSomeLink.DONWLOAD('filename','http://xxxxxx')"></div>

```
#### A链接下载2
```typescript
let getSomeLink= new api('database','download')
getSomeLink.GET().then(res=>{
  
})
<a onclick="getSomeLink.DONWLOAD('filename','http://xxxxxx')"></a>
```
## 设置拦截器
通常用于全局的请求与响应前的工作例如：请求头的操作，请求的用户token，报错代码的统一处理，
```typescript
import Api from './api'

Api.setRequestInterceptors((req: AxiosRequestConfig) => {
  //do something
  return req
}, (err: AxiosError) => {
  return Promise.reject(err)
})

Api.setResponseInterceptors((res: AxiosRequestConfig) => {
  return res
}, (err: AxiosError, response: AxiosResponse) => {
  if (response?.status === 401) {
    console.log('401', response.data.detail)
  }
  err.response = response;
  return err
})
```
# 进阶功能
### 数据接口Adapt
数据接口允许注册一个函数，在终端收到返回值之前将调用，终端会收到函数的返回值，注意这是一个同步函数不能在其中进行异步调用
```typescript
//例如这样一个场景，我们请求来的数据为x和y的，但是组件中需要将名称改为xAxis，yAxis，这样的场景
//推荐使用adapt来操作
api.runOrderSwitch.setAdapter('GET', (res) => {
    console.log(res)
    res.data.results['xAxis'] = res.data.results['x']
    res.data.results['yAxis'] = res.data.results['y']
    return res
})
```
### 模拟本地服务
beforeDone支持异步请求
```typescript
import Api, {getChartsData} from './api'

//开启/关闭全局设置的localService，必须单个服务与全局服务同时开启，单个服务才能生效
Api.local_servers_on(true) 

// 模拟一个后端服务，拦截请求并返回数据
// service内只能写同步的方法
//beforeDone，在数据返回之前能够异步调用一些数据，beforeDone内可以进行异步调用
// beforeDone返回的数据能够在服务中获取
getChartsData.onLocalService('GET', (req, before) => {
    console.log('done', before)
    return {
        results: {
            xAxis: date,
            yAxis: data
        }
    }
}, (req,resolve,reject) => {
    setTimeout(() => {
        resolve({ 'done': 'before' })
    }, 5000);

})
```
### 响应分发
当某个接口调用并返回时可以获取到返回值，这项功能可以用于组件间的交流，绝对本地服务的话都推荐监听LINK方法
```typescript
import {localTest} from './api'

// 当某个接口调用并返回时可以获取到返回值
localTest.resListeners('GET',(data)=>{
  
})
```
## 请求全流程
注意所有圆角矩形是都是可以省略，而矩形框不能省略
![](https://cdn.nlark.com/yuque/0/2022/jpeg/26397694/1650337537337-28296a90-a1e1-4bef-ae31-020c4afb26d2.jpeg)
