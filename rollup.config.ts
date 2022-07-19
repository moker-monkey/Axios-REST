import path from 'path'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import rollupTypescript from 'rollup-plugin-typescript2'
import pluginJSON from '@rollup/plugin-json'
import babel from '@rollup/plugin-babel'
import { DEFAULT_EXTENSIONS } from '@babel/core'
import { terser } from 'rollup-plugin-terser' // 读取 package.json 配置 
import pkg from './package.json' // 当前运行环境，可通过 cross-env 命令行设置 
const env = process.env.NODE_ENV // umd 模式的编译结果文件输出的全局变量名称 
const name = 'axios-rest'
const config = {
	// 入口文件，src/index.ts 
	input: path.resolve(__dirname, 'src/index.ts'),
	// 输出文件 
	output: [
		// commonjs 
		{
			// package.json 配置的 main 属性 
			file: pkg.main,
			exports: 'named',
			format: 'cjs',
		},
		// es module 
		{
			// package.json 配置的 module 属性 
			file: pkg.module,
			exports: 'named',
			format: 'es',
		},
		// umd 
		// {
		// 	// umd 导出文件的全局变量 
		// 	name,
		// 	// package.json 配置的 umd 属性 
		// 	file: pkg.browser,
		// 	exports: 'named',
		// 	format: 'umd',
		// 	globals:{
		// 		lodash:'lodash',
		// 		axios:'axios',
		// 		localservicejs:'localservicejs'
		// 	}
		// }
	],
	external: ['lodash', 'axios', 'localservicejs'],
	plugins: [
		// 解析第三方依赖 
		resolve(),
		// rollup 编译 typescript 
		rollupTypescript(),

		// 识别 commonjs 模式第三方依赖 
		commonjs(),
		pluginJSON(),
		// babel 配置 
		babel({
			// 编译库使用 
			babelHelpers: 'runtime',
			// 只转换源代码，不转换外部依赖 
			exclude: 'node_modules/**',
			// babel 默认不支持 ts 需要手动添加 
			extensions: [
				...DEFAULT_EXTENSIONS,
				'.ts',
			],
		}),

	]
}
// 若打包正式环境，压缩代码 
if (env === 'production') {
	config.plugins.push(terser({
		compress: {
			pure_getters: true,
			unsafe: true,
			unsafe_comps: true,
		}
	}))
}

export default config