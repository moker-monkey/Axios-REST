export enum type {
    'input' = 'input',
    'select' = 'select',
    'selectObject' = 'selectObject',
    'radio' = 'radio',
    'checkbox' = 'checkbox',
    'inputNumber' = 'inputNumber',
    'cascader' = 'cascader',
    'switch' = 'switch',
    'slider' = 'slider',
    'timePicker' = 'timePicker',
    'datePicker' = 'datePicker',
    'dateTimePicker' = 'dateTimePicker',
    'upload' = 'upload',
    'rate' = 'rate',
    'colorPicker' = 'colorPicker',
    'transfer' = 'transfer',
    'list' = 'list'
}

interface component {
    type: type,
    options?: any,
    configs?: any
}

export enum paramsType {
    'string' = 'string',
    'number' = 'number',
    'boolean' = 'boolean',
    'object' = 'object',
}

export interface Param {
    key: string,
    require: boolean,  // 表明该字段为必有
    value?: any, // 用于生成默认值
    type: paramsType,
    isNull: boolean,   // 表明该字段的值是否可以为null例如空数字
    validate: any[],
    label?: string,
    quote?: string,
    options?: any[],  // 如果type是一个list类型,那么options可以限定可选项的值，并且options必须是写死的值
    __key?: string,   // 用于quote的校验报错
    describe?: string, // 描述该字段应该输入怎么样的内容
    isMultiValue?: boolean,
    separator?: string,
    component?: component, // 在自动生成表单表明生成什么样类型的组件
}
declare module 'vue/types/vue' {
    interface Vue {
        $api: any;
    }
}