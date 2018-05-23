'use strict';

module.exports = function checkExtras(changelog) {
    const modifiedLog = changelog;
    const config = this.config;

    if (config.extras) {
        if (config.extras.pivotal) {
            Object.keys(modifiedLog).forEach((changeType) => {
                modifiedLog[changeType].forEach((entry, index) => {
                    const pivotalURL = `https://www.pivotaltracker.com/n/projects/${config.extras.pivotal.boardID}`;
                    modifiedLog[changeType][index] = entry.replace(/\[#(\d+)\]/, (match, id) => {
                        return `[${match}](${pivotalURL}/stories/${id})`;
                    });
                });
            });
        }
    }

    return modifiedLog;
};
