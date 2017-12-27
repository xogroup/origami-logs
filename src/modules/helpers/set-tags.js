'use strict';
const git = require('git-rev-sync');

module.exports = function(tags) {
    let [tag1, tag2] = tags || [];
    if (!tag1 || !tag2 || tags.length === 0) {
        //default from current commit to the HEAD
        tag1 = tag1 || git.tag();
        tag2 = tag2 || 'HEAD';
    }

    return {tag1, tag2};
};
