'use strict';
const config = require('../../../.changelog-generator-config.json');

module.exports = function checkAliasLabels(label) {
    let labelToReturn = '';

    Object.keys(config.aliases).forEach((alias) => {
        if (config.aliases[alias].includes(label)) {
            labelToReturn = alias;
        }
    });

    if (labelToReturn === '') {
        return label;
    }

    return labelToReturn;
};
