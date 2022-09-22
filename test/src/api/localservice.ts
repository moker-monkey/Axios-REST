import { getMenu } from './index'

getMenu.setService('GET', (req: any, resolve: any, reject: any) => { console.log(req); resolve({ status: 201, response: { hello: 'world' } }) })