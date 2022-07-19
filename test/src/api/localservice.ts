import { getMenu } from './index'

getMenu.setService('GET', (req: any, resolve: any, reject: any) => { resolve({ status: 201, response: { hello: 'world' } }) })