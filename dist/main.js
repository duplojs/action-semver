import { Octokit } from '@octokit/rest';
import core from '@actions/core';
import { z } from 'zod';

const inputs = z.object({
  GITHUB_TOKEN: z.string({ message: "Missing ENV var GITHUB_TOKEN." }),
  GITHUB_OWNER: z.string({ message: "Missing ENV var GITHUB_OWNER." }),
  GITHUB_REPO: z.string({ message: "Missing ENV var GITHUB_REPO." }),
  GITHUB_BRANCHE: z.string({ message: "Missing ENV var GITHUB_BRANCHE." }),
  REGEXP_PATCH: z.string({ message: "Missing ENV var REGEXP_PATCH." }).transform((value) => new RegExp(value)),
  REGEXP_MINOR: z.string({ message: "Missing ENV var REGEXP_MINOR." }).transform((value) => new RegExp(value)),
  REGEXP_MAJOR: z.string({ message: "Missing ENV var REGEXP_MAJOR." }).transform((value) => new RegExp(value)),
  PER_PAGE: z.coerce.number().default(30)
}).parse({
  GITHUB_TOKEN: core.getInput("GITHUB_TOKEN") || void 0,
  GITHUB_OWNER: core.getInput("GITHUB_OWNER") || void 0,
  GITHUB_REPO: core.getInput("GITHUB_REPO") || void 0,
  GITHUB_BRANCHE: core.getInput("GITHUB_BRANCHE") || void 0,
  REGEXP_PATCH: core.getInput("REGEXP_PATCH") || void 0,
  REGEXP_MINOR: core.getInput("REGEXP_MINOR") || void 0,
  REGEXP_MAJOR: core.getInput("REGEXP_MAJOR") || void 0,
  PER_PAGE: core.getInput("PER_PAGE", { required: false }) || void 0
});
const octokit = new Octokit({
  auth: inputs.GITHUB_TOKEN
});
const closedPullRequestCollection = await async function getPullRequestTitles(page = 1) {
  const closedPullRequests = await octokit.pulls.list({
    owner: inputs.GITHUB_OWNER,
    repo: inputs.GITHUB_REPO,
    state: "closed",
    base: inputs.GITHUB_BRANCHE,
    per_page: inputs.PER_PAGE,
    page
  });
  if (closedPullRequests.data.length === inputs.PER_PAGE) {
    return [...await getPullRequestTitles(page + 1), ...closedPullRequests.data];
  } else {
    return closedPullRequests.data;
  }
}();
const mergedPullRequestTitleCollection = closedPullRequestCollection.filter((pullRequest) => !!pullRequest.merged_at).sort((a, b) => Date.parse(a.merged_at || "") - Date.parse(b.merged_at || "")).map((pullRequest) => pullRequest.title);
let major = 0;
let minor = 0;
let patch = 0;
for (const title of mergedPullRequestTitleCollection) {
  if (inputs.REGEXP_PATCH.test(title)) {
    patch++;
  } else if (inputs.REGEXP_MINOR.test(title)) {
    patch = 0;
    minor++;
  } else if (inputs.REGEXP_MAJOR.test(title)) {
    patch = 0;
    minor = 0;
    major++;
  }
}
core.setOutput("COMPUTED_VERSION", `${major}.${minor}.${patch}`);
