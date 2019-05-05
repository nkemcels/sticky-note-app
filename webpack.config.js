const rpath = require("path")

module.exports = {
    entry: "./src/index.js",
    devtool:"source-map",
    output: {
        path: rpath.join(__dirname, "./dist"),
        filename: "bundle.js"
    },
    module:{
        rules:[
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                options:{
                        "presets": [["@babel/preset-env", {"modules":false}], ["@babel/preset-react", {"modules":false}]],
                        "plugins": ["transform-class-properties"]
                    
                },
            },
            {
                test: /\.(css|scss)$/,
                exclude:/node_modules/,
                loaders: ["style-loader", "css-loader"]
            }
        ]
    },
    node: {
        __dirname: false,
        __filename: false
    },
    target: 'electron-renderer'
}