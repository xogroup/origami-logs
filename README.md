# github_changelog_generator

A generator for your release notes.

## First Step

Create a file named `.changelog-generator-config.json` in the root of your project

The file should look something like this:

```
{
  "github":{
    "apiUrl": "https://git.somedomain.com/api/v3",
    "token": "123456",
    "repository": "Organization/repo-name"
  },
  "aliases": {
    "enhancement": [
      "feature"
    ]
  },
  "extraLabels": {
    "chore": "Chores Completed:"
  },
  "extras": {
    "pivotal":{
      "boardID": "1234567"
    }
  }
}
```

## How to use

TO RUN:

```
node src/index.js generate --tags "startingTag,endingTag"
```

## Config Options Explained

* `github`: The info about the given repository you wish to get the changelog formatForMarkdown
* `aliases`: This is to be used if you want to use your own custom labels but still conform to the enhance/bug format.
  * IE: You might have a feature label but still want it to show `Features Implemented` on the changelog.
* `extraLabels`: Define your own custom labels and changelog headings
* `extras`: Where additional connections live
  * `pivotal`: Supports linking pivotal stories in your change log assuming commits conform to the format:
    `[#STORY_ID_HERE] Commit Message here`
    * `boardID`: Pivotal Board ID (Found at the end of the url such as `https://www.pivotaltracker.com/n/projects/ID-HERE`)
