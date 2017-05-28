const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    watch: true,
    devtool: 'source-map',

    entry: "./src/js/entry.js",
    output: {
        path: __dirname + '/www/assets',
        filename: "bundle.js"
    },
    module: {
        rules: [

            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            }

        ]
    },
    plugins: [
        //new webpack.optimize.UglifyJsPlugin(),
        new webpack.ProvidePlugin({
            jQuery: 'jquery',
            $: "jquery",
            jquery: "jquery"
        }),
        new ExtractTextPlugin("styles.css"),
    ],

};