# duplojs action semver
A simple compute semver from pull request titles.

## Exemple
```yml
uses: duplojs/action-semver
with:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  GITHUB_OWNER: duplojs
  GITHUB_REPO: action-semver
  GITHUB_BRANCHE: main
  REGEXP_PATCH: '^fix\\('
  REGEXP_MINOR: '^feat\\('
  REGEXP_MAJOR: '^break\\('
```

## Inputs
### `GITHUB_TOKEN`
**Required** Token github action : `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}`.
### `GITHUB_OWNER`
**Required** Owner or organization name : `GITHUB_OWNER: duplojs`.
### `GITHUB_REPO`
**Required** Repository name : `GITHUB_REPO: action-semver`.
### `GITHUB_BRANCHE`
**Required** Branche target : `GITHUB_BRANCHE: main`.
### `REGEXP_PATCH`
**Required** Regex wich match with PATCH pull request title : `REGEXP_PATCH: '^fix\\('`.
### `REGEXP_MINOR`
**Required** Regex wich match with MINOR pull request title : `REGEXP_MINOR: '^feat\\('`.
### `REGEXP_MAJOR`
**Required** Regex wich match with MAJOR pull request title : `REGEXP_MAJOR: '^break\\('`.
### `PER_PAGE`
**Optional** Number of pull requests taken per request : `PER_PAGE: 30`.

## Outputs
### COMPUTED_VERSION
Computed version as `major.minor.patch`.