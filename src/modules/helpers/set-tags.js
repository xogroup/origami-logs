'use strict';
const git = require('git-rev-sync');

module.exports = function(tags) {
    if (tags === undefined) {
        throw new Error('Tags should be set');
    }

    let [tag1, tag2] = tags || [];
    if (!tag1 || !tag2) {
        //default from current commit to the HEAD
        tag1 = tag1 || git.tag();
        tag2 = tag2 || 'HEAD';
    }

    return {tag1, tag2};
};
