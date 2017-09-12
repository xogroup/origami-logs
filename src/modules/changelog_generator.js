const Promise = require('bluebird');
const fs = require('fs');
const util = require('util');
const config = require('../../.changelog_generator_config.json');

const initializeEndpoints = function initializeEndpoints() {
  this.repo = this.client.getRepo('LocalPartners', 'hapi-marketplace-api-graphql');
  this.issues = this.client.getIssues('LocalPartners', 'hapi-marketplace-api-graphql');
};

const compareBranches = function compareBranches() {
  return this.repo.compareBranches('v1.2.0', 'HEAD');
};

const hydrateCommitEntry = function hydrateCommitEntry(commitMessage, issueNumber) {
  const numberToReplace = commitMessage.match(/(\(#\d+\))/)[0];
  let message;
  let author;

  return this.repo.getPullRequest(issueNumber).then((response) => {
    message = commitMessage.replace(numberToReplace, `[${numberToReplace}](${response.data.url})`);
    author = `[${response.data.user.login}](${response.data.user.url})`;
    return `${message} ${author}`;
  });
};

const checkAliasLabels = function checkAliasLabels(label) {
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

const generateChangelog = function generateChangelogEntry(response) {
  return new Promise((resolve, reject) => {
    const changelog = {
      enhancement: [],
      bug: [],
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
          return hydrateCommitEntry.call(this, commitMessage, number).then((entry) => {
            labels.forEach((label) => {
              const labelName = checkAliasLabels(label.name);
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
      }).catch((error) => { reject(error); console.log(error); }));
    });

    Promise.all(list)
      .then(() => { resolve(changelog); })
      .catch((error) => { reject(error); });
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
  const extendedChangelog = {};

  const changeTypeDescription = Object.assign({
    enhancement: 'Features Implemented:',
    bug: 'Bugs Fixed:',
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

const writeToFile = function writeToFile(changelog) {
  fs.writeFile('CHANGELOG.md', changelog, (err) => {
    console.log(err);
  });
};


module.exports = function exports(client, tags) {
  const context = {
    client,
    tags,
    repo: null,
    issues: null,
  };

  return Promise
    .resolve()
    .bind(context)
    .then(initializeEndpoints)
    .then(compareBranches)
    .then(generateChangelog)
    .then(formatChangelog)
    .then(checkExtras)
    .then(formatForMarkdown)
    .then(writeToFile)
    .then(() => {
      console.log('Changelog generated in CHANGELOG.md');
    })
    .catch((error) => {
      console.log(error);
    });
};
