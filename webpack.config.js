const webpack = require('webpack');

module.exports = {
    watch: true,
    devtool: 'source-map',

    entry: "./src/entry.js",
    output: {
        path: __dirname + '/www/assets',
        filename: "bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                loaders: [
                    'style-loader',
                    'css-loader?sourceMap'
                ]
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
    ],

};
