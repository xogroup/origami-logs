'use strict';

const Lab = require('lab');
const { script, assertions } = Lab;
const lab = exports.lab = script();
const { describe, it } = lab; //expect
const Promise = require('bluebird');
const Helpers = require('../src/modules/helpers');
assertions.should();

describe('Implementation', () => {
    const context = {
        repo: {
            getPullRequest: function() {
                return Promise.resolve({
                    data: {
                        url : 'google.com',
                        user: {
                            login: 'nrodriguez',
                            url  : 'https://api.github.com/users/nrodriguez'
                        }
                    }
                });
            }
        }
    };

    describe('hydrateCommitEntry()', () => {
        it('hydrates the commit with the url to the commit and author', async() => {
            const inputCommit = '[#153412695] Fix mediaSummary count (#32)';
            const hydratedCommit = '[#153412695] Fix mediaSummary count [(#32)](google.com) [nrodriguez](https://api.github.com/users/nrodriguez)';
            const subject = await Helpers.hydrateCommitEntry.call(context, inputCommit, '123');

            subject.should.equal(hydratedCommit);
        });
    });

    describe('checkAliasLabels()', () =>{
        it('checks if a label matches the aliases set and returns it', () =>{
            const inputLabel = 'feature';
            const expectedLabel = 'enhancement';

            Helpers.checkAliasLabels(inputLabel).should.equal(expectedLabel);
        });
    });
});
