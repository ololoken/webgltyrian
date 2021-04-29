import {Configuration, RuleSetRule, WebpackPluginInstance} from "webpack";
import {resolve, join} from 'path'
import HtmlWebpackPlugin from "html-webpack-plugin";
import {CleanWebpackPlugin} from "clean-webpack-plugin";
import CopyPlugin from 'copy-webpack-plugin';
import FaviconsWebpackPlugin from 'favicons-webpack-plugin';

const webAppPlugins: WebpackPluginInstance[] = [
    new HtmlWebpackPlugin({title: 'webgltyrian'}),
    new CleanWebpackPlugin(),
    new CopyPlugin({patterns: [
            { from: 'assets', to: 'assets' },
            { from: 'data', to: 'assets/data' }
    ]}),
    new FaviconsWebpackPlugin({logo: 'data/icon.png', mode: 'light', devMode: 'light'})
]

const tsRuleBase: RuleSetRule = {
    test: /\.ts$/i,
    loader: 'ts-loader',
    exclude: [
        '/src/tools/*'
    ],
    options: {
        configFile: resolve(__dirname, 'tsconfig.json')
    }
}

const webAppConfig: Configuration = {
    mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
    entry: {
        'tyrian': resolve(__dirname, 'src', 'Tyrian.ts')
    },
    devtool: 'source-map',
    output: {
        filename: '[name].bundle.js',
        path: join(__dirname, 'dist')
    },
    target: 'web',
    plugins: webAppPlugins,
    module: {
        rules: [tsRuleBase]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
}


export default [
    webAppConfig
]
