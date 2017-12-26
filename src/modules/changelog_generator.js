'use strict';

const Promise = require('bluebird');
const fs = require('fs');
const config = require('../../.changelog-generator-config.json');
const Helpers = require('./helpers');

const initializeEndpoints = async function initializeEndpoints() {
    const [org, repo] = config.github.repo.split('/');

    this.repo = await this.client.getRepo(org, repo);
    this.issues = await this.client.getIssues(org, repo);
};

const compareBranches = function compareBranches() {
    return this.repo.compareBranches('v1.2.0', 'HEAD');
};

const generateChangelog = async function(response) {
    const changelog = {
        enhancement: [],
        bug        : []
    };

    // const list = response.data.commits.forEach(async(commit) => {
        // const searchResult = await this.client.search().forIssues({ q: commit.sha });
    //
    //     if (searchResult.data.length) {
    //         let commitMessage = commit.commit.message;
    //         const multiLine = commitMessage.indexOf('\n');
    //
    //         if (multiLine > 0) {
    //             // We want to strip out the rest of the multiline squashed commits
    //             commitMessage = commitMessage.substr(0, multiLine);
    //         }
    //
    //         const { number, labels } = searchResult.data[0];
    //
    //         const entry = await Helpers.hydrateCommitEntry.call(this, commitMessage, number);
    //
    //         labels.forEach((label) => {
    //             const labelName = Helpers.checkAliasLabels(label.name);
    //             if (changelog[labelName]) {
    //                 if (changelog[labelName].includes(entry)) {
    //                     // Prevent duplicate logged entries
    //                     // (usually if a commit is tagged with two different labels
    //                     // that are aliases of each other)
    //                     return;
    //                 }
    //                 console.log('ADD here', entry);
    //                 changelog[labelName].push(entry);
    //             } else {
    //                 changelog[labelName] = [];
    //                 changelog[labelName].push(entry);
    //             }
    //         });
    //     }
    // });

    for (let i = 0; i < response.data.commits.length; ++i) {
        let commit = response.data.commits[i];
        const searchResult = await this.client.search().forIssues({ q: commit.sha });

        if (searchResult.data.length) {
            let commitMessage = commit.commit.message;
            const multiLine = commitMessage.indexOf('\n');

            if (multiLine > 0) {
                // We want to strip out the rest of the multiline squashed commits
                commitMessage = commitMessage.substr(0, multiLine);
            }

            const { number, labels } = searchResult.data[0];

            const entry = await Helpers.hydrateCommitEntry.call(this, commitMessage, number);

            for (let j = 0; j < labels.length; ++j) {
                let label = labels[j];
                const labelName = Helpers.checkAliasLabels(label.name);

                if (changelog[labelName]) {
                    if (changelog[labelName].includes(entry)) {
                        // Prevent duplicate logged entries
                        // (usually if a commit is tagged with two different labels
                        // that are aliases of each other)
                        return;
                    }
                    console.log('ADD here', entry);
                    changelog[labelName].push(entry);
                } else {
                    changelog[labelName] = [];
                    changelog[labelName].push(entry);
                }
            }
            // labels.forEach((label) => {
            //     const labelName = Helpers.checkAliasLabels(label.name);
            //     if (changelog[labelName]) {
            //         if (changelog[labelName].includes(entry)) {
            //             // Prevent duplicate logged entries
            //             // (usually if a commit is tagged with two different labels
            //             // that are aliases of each other)
            //             return;
            //         }
            //         console.log('ADD here', entry);
            //         changelog[labelName].push(entry);
            //     } else {
            //         changelog[labelName] = [];
            //         changelog[labelName].push(entry);
            //     }
            // });
        }
    }

    // const list = response.data.commits.map(async(commit) => {
    //     const searchResult = await this.client.search().forIssues({ q: commit.sha });
    //
    //     if (searchResult.data.length) {
    //         let commitMessage = commit.commit.message;
    //         const multiLine = commitMessage.indexOf('\n');
    //
    //         if (multiLine > 0) {
    //             // We want to strip out the rest of the multiline squashed commits
    //             commitMessage = commitMessage.substr(0, multiLine);
    //         }
    //
    //         const { number, labels } = searchResult.data[0];
    //
    //         const entry = await Helpers.hydrateCommitEntry.call(this, commitMessage, number);
    //
    //         labels.forEach((label) => {
    //             const labelName = Helpers.checkAliasLabels(label.name);
    //             if (changelog[labelName]) {
    //                 if (changelog[labelName].includes(entry)) {
    //                     // Prevent duplicate logged entries
    //                     // (usually if a commit is tagged with two different labels
    //                     // that are aliases of each other)
    //                     return;
    //                 }
    //                 console.log('ADD here');
    //                 changelog[labelName].push(entry);
    //             } else {
    //                 changelog[labelName] = [];
    //                 changelog[labelName].push(entry);
    //             }
    //         });
    //     }
    // });
    console.log('FINAL', changelog);

    return changelog;
};

const generateChangelog2 = function generateChangelogEntry(response) {
    return new Promise((resolve, reject) => {
        const changelog = {
            enhancement: [],
            bug        : []
        };

        const list = response.data.commits.map((commit) => {
            return (this.client.search().forIssues({ q: commit.sha }).then((searchResult) => {
                if (searchResult.data.length) {
                    let commitMessage = commit.commit.message;
                    const multiLine = commitMessage.indexOf('\n');

                    if (multiLine > 0) {
                        // We want to strip out the rest of the multiline squashed commits
                        commitMessage = commitMessage.substr(0, multiLine);
                    }

                    const { number, labels } = searchResult.data[0];

                    return Helpers.hydrateCommitEntry.call(this, commitMessage, number).then((entry) => {
                        console.log('ENTRY', entry);
                        labels.forEach((label) => {
                            const labelName = Helpers.checkAliasLabels(label.name);
                            if (changelog[labelName]) {
                                if (changelog[labelName].includes(entry)) {
                                    // Prevent duplicate logged entries
                                    // (usually if a commit is tagged with two different labels
                                    // that are aliases of each other)
                                    return;
                                }

                                changelog[labelName].push(entry);
                            } else {
                                changelog[labelName] = [];
                                changelog[labelName].push(entry);
                            }
                        });
                    });
                }
            }).catch((error) => {
                reject(error); console.log(error);
            }));
        });

        Promise.all(list)
            .then(() => {
                resolve(changelog);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

const removeEmpty = (obj) => {
    Object.keys(obj).forEach((key) => {
        if (obj[key] === null || obj[key].length === 0) {
            delete obj[key];
        }
    });

    return obj;
};

const formatChangelog = function formatChangelog(changelog) {
    console.log('TIME TO FORMAT', changelog);
    const extendedChangelog = {};

    const changeTypeDescription = Object.assign({
        enhancement: 'Features Implemented:',
        bug        : 'Bugs Fixed:'
    }, config.extraLabels);

    // Replace labels with headers
    Object.keys(changelog).forEach((changeType) => {
        if (changeTypeDescription[changeType] !== undefined) {
            extendedChangelog[changeTypeDescription[changeType]] = changelog[changeType];
        } else {
            extendedChangelog[changeType] = changelog[changeType];
        }
    });

    return removeEmpty(extendedChangelog);
};

const checkExtras = function checkExtras(changelog) {
    const modifiedLog = changelog;
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


const formatForMarkdown = function formatForMarkdown(changelog) {
    let log = '';
    // Format for Markdown
    Object.keys(changelog).forEach((changeset) => {
        log += `\n\n**${changeset}**\n`;
        changelog[changeset].forEach((change) => {
            log += `* ${change}\n`;
        });
    });

    return log;
};

const writeToFile = async function writeToFile(changelog) {
    await fs.writeFile('CHANGELOG.md', changelog);
};

const genx = async function(comparedBranches, client, repo) {
    const changelog = {
        enhancement: [],
        bug        : []
    };

    for (const commit of comparedBranches.data.commits) {
        const searchResult = await client.search().forIssues({ q: commit.sha });

        if (searchResult.data.length) {
            let commitMessage = commit.commit.message;
            const multiLine = commitMessage.indexOf('\n');

            if (multiLine > 0) {
                // We want to strip out the rest of the multiline squashed commits
                commitMessage = commitMessage.substr(0, multiLine);
            }

            const { number, labels } = searchResult.data[0];

            let fauxContext = {
                repo
            };

            const entry = await Helpers.hydrateCommitEntry.call(fauxContext, commitMessage, number);

            for (const label of labels) {
                const labelName = Helpers.checkAliasLabels(label.name);

                if (changelog[labelName]) {
                    if (changelog[labelName].includes(entry)) {
                        // Prevent duplicate logged entries
                        // (usually if a commit is tagged with two different labels
                        // that are aliases of each other)
                        return;
                    }
                    console.log('1 in loop');
                    changelog[labelName].push(entry);
                } else {
                    changelog[labelName] = [];
                    changelog[labelName].push(entry);
                }
            }
        }
    }
    console.log('2 Out of loop');

    return changelog;
};


module.exports = async function exports(client, tags) {
    // const context = {
    //     client,
    //     tags,
    //     repo  : null,
    //     issues: null
    // };
    let repo;
    let issues;
    let comparedBranches;
    let finalChangeLog;

    const [org, repository] = config.github.repository.split('/');

    try {
        repo = await client.getRepo(org, repository);
        issues = await client.getIssues(org, repository);
        comparedBranches = await repo.compareBranches('v1.2.0', 'HEAD');
        finalChangeLog = await genx(comparedBranches, client, repo);

        const formattedChangelog = formatChangelog(finalChangeLog);
        const modifiedLog = checkExtras(formattedChangelog);
        const payload = formatForMarkdown(modifiedLog);

        await writeToFile(payload);
    } catch (e) {
        console.log(e, 'aSOMETHING HAPPENED');
    }

    // return Promise
    //     .resolve()
    //     .bind(context)
    //     .then(initializeEndpoints)
    //     .then(compareBranches)
    //     .then(generateChangelog)
    //     .then(formatChangelog)
    //     .then(checkExtras)
    //     .then(formatForMarkdown)
    //     .then(writeToFile)
    //     .then(() => {
    //         console.log('Changelog generated in CHANGELOG.md');
    //     })
    //     .catch((error) => {
    //         console.log(error);
    //     });
    process.nextTick(function() {
        console.log(finalChangeLog, 'After next tik');
    });
};
