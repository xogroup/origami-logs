'use strict';
const config = require('../../../.changelog-generator-config.json');

module.exports = function checkAliasLabels(label) {
    let labelToReturn = '';

    const aliasKeys = Object.keys(config.aliases);

    for (const alias of aliasKeys) {
        if (config.aliases[alias].includes(label)) {
            labelToReturn = alias;
        }
    }

    if (labelToReturn === '') {
        return label;
    }

    return labelToReturn;
};
