const path = require('path');

module.exports = function(config) {
    config.resolve.alias.intact$ = path.resolve(__dirname, './dist/index.js');
    config.module.rules.find(rule => {
        if (rule.test.toString() === '/\\.css$/') {
            rule.exclude.push(path.resolve(__dirname, 'node_modules/kpc'));
            return true;
        }
    });

    return config;
}

