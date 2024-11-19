const webpack = require('@nativescript/webpack');

module.exports = (env) => {
    webpack.init(env);

    // Configure webpack
    webpack.chainWebpack((config) => {
        config.module
            .rules
            .delete('jsx')
            .end();

        config.module
            .rule('jsx')
            .test(/\.(js|jsx|ts|tsx)$/)
            .exclude(/node_modules/)
            .use('babel')
            .loader('babel-loader')
            .options({
                presets: ['@babel/preset-react'],
                plugins: ['@babel/plugin-transform-runtime']
            });
    });

    return webpack.resolveConfig();
}