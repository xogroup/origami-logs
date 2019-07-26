'use strict';
const Hoek = require('@hapi/hoek');

module.exports = function checkAliasLabels(label) {
    let labelToReturn = '';
    const config = this.config;
    const aliases = Hoek.reach(config, 'aliases');

    //Check if custom aliases are set
    if (aliases) {
        for (const alias of Object.keys(aliases)) {
            if (config.aliases[alias].includes(label)) {
                labelToReturn = alias;
            }
        }
    }

    if (labelToReturn === '') {
        return label;
    }

    return labelToReturn;
};
