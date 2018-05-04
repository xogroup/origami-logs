'use strict';

const Lab = require('lab');
const fs = require('fs');
const sinon = require('sinon');
const { script, assertions } = Lab;
const lab = exports.lab = script();
const { describe, it, expect, before, after } = lab;
let githubClient = require('../src/modules/github_client');
const changelogGenerator = require('../src/modules/changelog_generator');
const config = require('../.changelog-generator-config-template');

assertions.should();

describe('Integration', () =>{
    const context = {
        config
    };

    before(() =>{
        const writeToFile = sinon.fake.returns(true);
        sinon.replace(fs, 'writeFileSync', writeToFile);
    });

    after(() =>{
        sinon.restore();
    });

    const sampleCommit = {
        sha   : '4be33ee7ba38ee00ec2b3f3d96e0bbba553fbd65',
        commit: {
            author: {
                name : 'JustNeph',
                email: 'justneph@xogrp.com',
                date : '2017-12-05T17:02:34Z'
            },
            committer: {
                name : 'Github',
                email: 'github@github.com',
                date : '2017-12-05T17:02:34Z'
            },
            message: '[#1234567] Adds a fix to properly return the internal mediaSummary … (#31)\n\n* [#153019762] Adds a fix to properly return the internal mediaSummary structure for Limited vendors\r\n\r\n* Changed let to const in test'
        }};
    githubClient = {
        getRepo: function() {
            return {
                compareBranches: function() {
                    return {
                        data: {
                            commits: [sampleCommit]
                        }
                    };
                },
                getPullRequest: function() {
                    return {
                        data: {
                            user: {
                                url  : 'github.com/justneph',
                                login: 'justneph'
                            },
                            url: 'github.com/project/1234567'
                        }
                    };
                }
            };
        },
        search: function() {
            return {
                forIssues: function() {
                    return {
                        data: [{
                            name  : 'TEST',
                            labels: [
                                { name: 'enhancement' }
                            ]
                        }]
                    };
                }
            };
        }
    };

    it('generates the CHANGELOG.md file with the expected changelog', async() =>{
        const expected = '\n\n**Features Implemented:**\n* [[#1234567]](https://www.pivotaltracker.com/n/projects/1234567/stories/1234567) Adds a fix to properly return the internal mediaSummary … [(#31)](github.com/project/1234567) [justneph](github.com/justneph)\n';
        await changelogGenerator.call(context, githubClient, ['v1.2.1', 'HEAD']);
        expect(fs.writeFileSync.called).to.be.true;
        expect(fs.writeFileSync.lastArg).to.equal(expected);
    });
});
