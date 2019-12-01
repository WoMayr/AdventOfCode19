const process = require("process");
const path = require("path");

const { CheckerPlugin } = require("awesome-typescript-loader");
const webpack = require("webpack");

const basePath = process.cwd();

module.exports = {
    entry: {
        main: "./src/index.ts",
        style: "./src/style.scss"
    },
    output: {
        path: path.resolve(basePath, "dist")
    },

    mode: "development",
    devtool: "source-map",
    devServer: {
        watchContentBase: true,
    },

    resolve: {
        extensions: [".ts", ".js", ".scss", ".css"]
    },
    module: {
        rules: [
            {
                test: /\.scss/,
                use: [
                    "style-loader", // creates style nodes from JS strings
                    "css-loader", // translates CSS into CommonJS
                    "sass-loader" // compiles Sass to CSS, using Node Sass by default
                ]
            },
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader'
            }
        ]
    },
    plugins: [
        new CheckerPlugin()
    ]
}