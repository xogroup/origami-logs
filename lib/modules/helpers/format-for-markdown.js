'use strict';

module.exports = function formatForMarkdown(changelog) {
    let log = '';

    // Format for Markdown
    Object.keys(changelog).forEach((changeset, index) => {
        if (index > 0) {
            log += '\n\n';
        }

        log += `**${changeset}**\n`;

        changelog[changeset].forEach((change) => {
            log += `* ${change}\n`;
        });
    });

    return log;
};
