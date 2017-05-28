module.exports = {
    watch: true,

    entry: "./src/js/entry.js",
    output: {
        path: __dirname + '/www/assets',
        filename: "bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.css$/, loader: "style-loader!css-loader"
            }
        ]
    },
    plugins: [
        //new webpack.optimize.UglifyJsPlugin(),
        // new webpack.ProvidePlugin({
        //     jQuery: 'jquery',
        //     $: "jquery",
        //     jquery: "jquery"
        // })
    ]
};