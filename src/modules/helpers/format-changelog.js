'use strict';

const config = require('../../../.changelog-generator-config.json');
const internals = {};


module.exports = function formatChangelog(changelog) {

    const extendedChangelog = {};

    const changeTypeDescription = Object.assign(
        {
            enhancement: 'Features Implemented:',
            bug        : 'Bugs Fixed:'
        }, 
        config.extraLabels
    );

    // Replace labels with headers
    Object.keys(changelog).forEach((changeType) => {

        if (changeTypeDescription[changeType] !== undefined) {

            extendedChangelog[changeTypeDescription[changeType]] = changelog[changeType];

        } else {

            extendedChangelog[changeType] = changelog[changeType];
        }
    });

    return internals.removeEmpty(extendedChangelog);
};

internals.removeEmpty = (obj) => {

    Object.keys(obj).forEach((key) => {

        if (obj[key] === null || obj[key].length === 0) {

            delete obj[key];
        }
    });

    return obj;
};
