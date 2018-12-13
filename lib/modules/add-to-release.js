'use strict';

module.exports = async function(changelog, releaseType) {
    const { tag2 } = this.tags;
    const [owner, repo] = this.config.github.repository.split('/');

    try {
        console.log('a', {
            owner,
            repo,
            tag: tag2
        });
        const release = await this.client.repos.getReleaseByTag({owner, repo, tag: tag2});

        const release_id = release.data.id;

        const releasePayload = {
            owner,
            repo,
            release_id,
            body      : changelog,
            prerelease: releaseType === 'pre'
        };

        return await this.client.repos.editRelease(releasePayload);
    } catch (error) {
        console.log(error);
        if (error.status === 'Not Found') {
            console.log('NOT FOUND', {
                owner,
                repo,
                tag_name  : tag2,
                body      : changelog,
                prerelease: releaseType === 'pre'
            });

            try {
                await this.client.repos.createRelease({
                    owner,
                    repo,
                    tag_name  : tag2,
                    body      : changelog,
                    prerelease: releaseType === 'pre'
                });
            } catch (e) {
                console.log('ER', e);
            }
        }
    }
};
