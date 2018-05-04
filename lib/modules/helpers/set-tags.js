'use strict';
// const git = require('git-rev-sync');

module.exports = function(tags) {
    if (tags === undefined) {
        throw new Error('Tags should be set');
    }

    let [tag1, tag2] = tags || [];

    if (!tag1 || !tag2) {
        throw new Error('Both Tags should be set');
    }

    return {tag1, tag2};
};
