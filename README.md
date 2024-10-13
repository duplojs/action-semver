# duplojs action semver
A simple compute semver from pull request titles.

## Exemple
```yml
uses: duplojs/action-semver
with:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  GITHUB_REPOSITORY: ${{ github.repository }}
  GITHUB_BRANCHE: main
  REGEXP_PATCH: '^fix'
  REGEXP_MINOR: '^feat'
  REGEXP_MAJOR: '^break'
```

## Inputs
### `GITHUB_TOKEN`
**Required** Token github action : `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}`.
### `GITHUB_REPOSITORY`
**Required** your repository name : `GITHUB_REPOSITORY: ${{ github.repository }}`.
### `GITHUB_BRANCHE`
**Required** Branche target : `GITHUB_BRANCHE: main`.
### `REGEXP_PATCH`
**Required** Regex wich match with PATCH pull request title : `REGEXP_PATCH: '^fix'`.
### `REGEXP_MINOR`
**Required** Regex wich match with MINOR pull request title : `REGEXP_MINOR: '^feat'`.
### `REGEXP_MAJOR`
**Required** Regex wich match with MAJOR pull request title : `REGEXP_MAJOR: '^break'`.
### `PATCH_START_AT`
**Optional** Number at which it begins patch : `PATCH_START_AT: 0` (default `0`).
### `MINOR_START_AT`
**Optional** Number at which it begins minor : `MINOR_START_AT: 16` (default `0`).
### `MAJOR_START_AT`
**Optional** Number at which it begins major : `MAJOR_START_AT: 20` (default `0`).
### `OUTPUT_FORMAT`
**Optional** Output format of computed version : `OUTPUT_FORMAT: v{MAJOR}.{MINOR}.{PATCH}` (default `{MAJOR}.{MINOR}.{PATCH}`).
### `CURRENT_PULL_REQUEST_TITLE`
**Optional** Places a string on top of the pull request stack which increments the counters : `CURRENT_PULL_REQUEST_TITLE: ${{ github.event.pull_request.title }}`.
### `PER_PAGE`
**Optional** Number of pull requests taken per request : `PER_PAGE: 10` (default `30`).

## Outputs
### COMPUTED_VERSION
Computed version is as same format input waht `OUTPUT_FORMAT`.