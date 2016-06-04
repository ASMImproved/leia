var webpackMerge = require('webpack-merge');
var commonConfig = require('./webpack.common.js');
var root = require('./root.helper');

module.exports = webpackMerge(commonConfig, {
    devtool: 'cheap-module-eval-source-map',

    output: {
        path: root('dist', 'public'),
        filename: '[name].js',
        chunkFilename: '[id].chunk.js'
    }
});