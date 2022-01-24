const path = require('path');

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: './frontend/frontend-script.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'frontend/script'),
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            }
        ],
    },
};
