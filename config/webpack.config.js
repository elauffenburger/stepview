const DEFAULT_WEBPACK_CONFIG = require('@ionic/app-scripts/config/webpack.config');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

const env = process.env.IONIC_ENV;

module.exports = function () {
    const config = monkeyPatchEnvironmentFileIntoConfig(DEFAULT_WEBPACK_CONFIG);
    injectPhaser(config);

    return DEFAULT_WEBPACK_CONFIG;
};

function monkeyPatchEnvironmentFileIntoConfig(config) {
    // Either use the existing env or use dev
    const environmentConfig = DEFAULT_WEBPACK_CONFIG[env] || DEFAULT_WEBPACK_CONFIG.dev;

    const environmentConfigFilePath = path.resolve(`./src/environments/environment.${env}.ts`);
    if (!fs.existsSync(environmentConfigFilePath)) {
        console.log(chalk.red(`Environment file '${environmentConfigFilePath}' for env '${env}' does not exist!'`));
        return process.exit(1);
    }

    environmentConfig.resolve.alias = environmentConfig.resolve.alias || {};
    environmentConfig.resolve.alias['@app/env'] = environmentConfigFilePath

    config[env] = environmentConfig;

    console.log('Done monkeypatching environment file');

    return environmentConfig;
}

function injectPhaser(config) {
    const phaserModulePath = path.resolve(__dirname, '../node_modules/phaser/');

    config.module = config.module || {};
    config.resolve = config.resolve || {};

    config.module.loaders = [
        ...config.module.loaders || [],
        { test: /pixi\.js/, loader: 'expose-loader?PIXI' },
        { test: /phaser-split\.js$/, loader: 'expose-loader?Phaser' },
        { test: /p2\.js/, loader: 'expose-loader?p2' }
    ];

    config.resolve.alias = {
        ...config.resolve.alias || {},
        'phaser': toPhaserPath('build/custom/phaser-split.js'),
        'pixi': toPhaserPath('build/custom/pixi.js'),
        'p2': toPhaserPath('build/custom/p2.js')
    };

    function toPhaserPath(pathPart) {
        return path.join(phaserModulePath, pathPart)
    }
}