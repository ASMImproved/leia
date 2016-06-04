var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/client/app/main.ts',

    resolve: {
        extensions: ['', '.js', '.ts']
    },

    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'ts'
            }, {
                test: /\.html$/,
                loader: 'html'
            }, {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'file?name=assets/[name].[hash].[ext]'
            }, {
                test: /\.scss$/,
                loaders: ['style', 'css', 'sass']
            }
        ]
    },
    ts: {
        configFileName: 'tsconfig.client.json'
    },
    htmlLoader: {
        minimize: false
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/client/index.html'
        }),
        new webpack.optimize.UglifyJsPlugin()
    ]
}
