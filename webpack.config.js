const webpack = require('webpack')
const {join, resolve} = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')

const pkgConfig = require('./package.json').config

const rootPath = join(__dirname, pkgConfig.root)
const componentsPath = join(__dirname, pkgConfig.components)


const webpackConfig = (env) => ({
    entry: `${rootPath}/index.js`,
    resolve: {
        mainFields: ['module', 'browser', 'main'],
        alias: {
            react: resolve('./node_modules/react'),
            'react-dom': resolve('./node_modules/react-dom'),
        },
        modules: [
            resolve('./node_modules/'),
            resolve('./src/'),
        ]
    },
    output: {
        path: resolve(__dirname, pkgConfig.dist),
        filename: '[name].js',
        publicPath: '',
        devtoolModuleFilenameTemplate: '/[absolute-resource-path]'
    },
    module: {
        rules: [
            {
                // Loaders for any other external packages styles
                test: /\.css$/,
                include: /node_modules/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: 'style-loader',
                        options: {
                            sourceMap: process.env.NODE_ENV !== 'production',
                        },
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            sourceMap: process.env.NODE_ENV !== 'production',
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            outputStyle: "expanded",
                            sourceMap: process.env.NODE_ENV !== 'production',
                            includePaths: [resolve("./node_modules/"), resolve("./src")]
                        },
                    }
                ],
            },
            {
                test: /\.js$/,
                use: {
                    loader: "babel-loader",

                }
            },
            {
                test: /\.svg$/,
                exclude: /node_modules/,
                loader: 'svg-react-loader',
                query: {
                    classIdPrefix: '[name]-[hash:8]__',
                    propsMap: {
                        fillRule: 'fill-rule',
                    },
                    xmlnsTest: /^xmlns.*$/
                }
            },
            {
                test: /\.(gif|png|jpe?g)$/i,
                loader: 'url-loader',
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: 'style-loader',
                        options: {
                            sourceMap: process.env.NODE_ENV !== 'production',
                        },
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            sourceMap: process.env.NODE_ENV !== 'production',
                        },
                    }
                ],
            }
        ]
    },
    devServer: {
        stats: {
            assets: false,
            children: false,
            chunks: false,
            hash: false,
            version: false
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'html-loader?interpolate!src/index.html'
        }),
    ]
})

module.exports = webpackConfig

