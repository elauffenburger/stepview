const config = require('@ionic/app-scripts/config/webpack.config');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

const env = process.env.IONIC_ENV;

module.exports = function () {
    monkeyPatchEnvironmentFileOnConfig(config);

    return config;
};

function monkeyPatchEnvironmentFileOnConfig(config) {
    // Either use the existing env or use dev
    const environmentConfig = config[env] || config.dev;

    const environmentConfigFilePath = path.resolve(`./src/environments/environment.${env}.ts`);
    if (!fs.existsSync(environmentConfigFilePath)) {
        console.log(chalk.red(`Environment file '${environmentConfigFilePath}' for env '${env}' does not exist!'`));
        return process.exit(1);
    }

    environmentConfig.resolve.alias = environmentConfig.resolve.alias || {};
    environmentConfig.resolve.alias['@app/env'] = environmentConfigFilePath

    config[env] = environmentConfig;

    console.log('Done monkeypatching environment file');
}