'use strict';

const Lab = require('lab');
const { script, assertions } = Lab;
const lab = exports.lab = script();
const { describe, it, after, expect } = lab;
let githubClient = require('../src/modules/github_client');
const changelogGenerator = require('../src/modules/changelog_generator');
// const config = require('../.changelog-generator-config.json');
// const Hoek = require('hoek');
// const Promise = require('bluebird');
// const Helpers = require('../src/modules/helpers');
assertions.should();

describe('Integration', () =>{
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
                compareBranches: function(tag1, tag2) {
                    data: {
                        commits: [sampleCommit];
                    }
                }
            };
        }};

    it.only('generates the CHANGELOG.md file', () =>{
        changelogGenerator(githubClient, ['v1.2.1', 'HEAD']);
    });
});
