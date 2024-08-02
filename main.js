import { Octokit } from "@octokit/rest";
import core from "@actions/core";
import { z as zod } from "zod";

const inputs = zod.object({
    GITHUB_TOKEN: zod.string({ message: "Missing ENV var GITHUB_TOKEN." }),
    GITHUB_OWNER: zod.string({ message: "Missing ENV var GITHUB_OWNER." }),
    GITHUB_REPO: zod.string({ message: "Missing ENV var GITHUB_REPO." }),
    GITHUB_BRANCHE: zod.string({ message: "Missing ENV var GITHUB_BRANCHE." }),
    REGEXP_PATCH: zod.string({ message: "Missing ENV var REGEXP_PATCH." }).transform(value => new RegExp(value)),
    REGEXP_MINOR: zod.string({ message: "Missing ENV var REGEXP_MINOR." }).transform(value => new RegExp(value)),
    REGEXP_MAJOR: zod.string({ message: "Missing ENV var REGEXP_MAJOR." }).transform(value => new RegExp(value)),
    PER_PAGE: zod.coerce.number().default(30),
}).parse({
    GITHUB_TOKEN: core.getInput("GITHUB_TOKEN"),
    GITHUB_OWNER: core.getInput("GITHUB_OWNER"),
    GITHUB_REPO: core.getInput("GITHUB_REPO"),
    GITHUB_BRANCHE: core.getInput("GITHUB_BRANCHE"),
    REGEXP_PATCH: core.getInput("REGEXP_PATCH"),
    REGEXP_MINOR: core.getInput("REGEXP_MINOR"),
    REGEXP_MAJOR: core.getInput("REGEXP_MAJOR"),
    PER_PAGE: core.getInput("PER_PAGE", {required: false}),
});

const octokit = new Octokit({
    auth: inputs.GITHUB_TOKEN
});

const pullRequestTitles = await (
    async function getPullRequestTitles(page = 1){
        const pullRequests = await octokit.pulls.list({
            owner: inputs.GITHUB_OWNER,
            repo: inputs.GITHUB_REPO,
            state: "closed",
            base: inputs.GITHUB_BRANCHE,
            sort: "created",
            direction: "desc",
            per_page: inputs.PER_PAGE,
            page: page,
        });

        let titles = pullRequests.data
            .filter(pull => pull.merged_at !== null)
            .map(pull => pull.title)
            .reverse();

        if(pulls.data.length === 30) {
            titles = [...await getPullRequestTitles(page + 1), ...titles];
        }

        return titles;
    }
)();

let major = 0;
let minor = 0;
let patch = 0;
for(const title of pullRequestTitles){
    if(inputs.REGEXP_PATCH.test(title)){
        patch++;
    }
    else if(inputs.REGEXP_MINOR.test(title)){
        patch = 0;
        minor ++;
    }
    else if(inputs.REGEXP_MAJOR.test(title)){
        patch = 0;
        minor = 0;
        major ++;
    }
}

core.setOutput("COMPUTED_VERSION", `${major}.${minor}.${patch}`);
