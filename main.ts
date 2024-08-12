import { Octokit } from "@octokit/rest";
import core from "@actions/core";
import { z as zod, ZodType } from "zod";

type InputsKey =
    | "GITHUB_TOKEN"
    | "GITHUB_OWNER"
    | "GITHUB_REPO"
    | "GITHUB_BRANCHE"

    | "REGEXP_PATCH"
    | "REGEXP_MINOR"
    | "REGEXP_MAJOR"

    | "PATCH_START_AT"
    | "MINOR_START_AT"
    | "MAJOR_START_AT"

    | "OUTPUT_FORMAT"
    | "PER_PAGE"

const inputsKey: { [P in InputsKey]: P } = {
    GITHUB_TOKEN: "GITHUB_TOKEN",
    GITHUB_OWNER: "GITHUB_OWNER",
    GITHUB_REPO: "GITHUB_REPO",
    GITHUB_BRANCHE: "GITHUB_BRANCHE",

    REGEXP_PATCH: "REGEXP_PATCH",
    REGEXP_MINOR: "REGEXP_MINOR",
    REGEXP_MAJOR: "REGEXP_MAJOR",

    PATCH_START_AT: "PATCH_START_AT",
    MINOR_START_AT: "MINOR_START_AT",
    MAJOR_START_AT: "MAJOR_START_AT",

    OUTPUT_FORMAT: "OUTPUT_FORMAT",
    PER_PAGE: "PER_PAGE",
}

const inputs = zod.object(
    {
        [inputsKey.GITHUB_TOKEN]: zod.string({ message: `Missing ENV var ${inputsKey.GITHUB_TOKEN}.` }),
        [inputsKey.GITHUB_OWNER]: zod.string({ message: `Missing ENV var ${inputsKey.GITHUB_OWNER}.` }),
        [inputsKey.GITHUB_REPO]: zod.string({ message: `Missing ENV var ${inputsKey.GITHUB_REPO}.` }),
        [inputsKey.GITHUB_BRANCHE]: zod.string({ message: `Missing ENV var ${inputsKey.GITHUB_BRANCHE}.` }),

        [inputsKey.REGEXP_PATCH]: zod.string({ message: `Missing ENV var ${inputsKey.REGEXP_PATCH}.` }).transform(value => new RegExp(value)),
        [inputsKey.REGEXP_MINOR]: zod.string({ message: `Missing ENV var ${inputsKey.REGEXP_MINOR}.` }).transform(value => new RegExp(value)),
        [inputsKey.REGEXP_MAJOR]: zod.string({ message: `Missing ENV var ${inputsKey.REGEXP_MAJOR}.` }).transform(value => new RegExp(value)),
        
        [inputsKey.PATCH_START_AT]: zod.coerce.number().default(0),
        [inputsKey.MINOR_START_AT]: zod.coerce.number().default(0),
        [inputsKey.MAJOR_START_AT]: zod.coerce.number().default(0),

        [inputsKey.OUTPUT_FORMAT]: zod.string().default("{MAJOR}.{MINOR}.{PATCH}"),
        [inputsKey.PER_PAGE]: zod.coerce.number().default(30),

    } satisfies Record<InputsKey, ZodType>
).parse(
    Object.values(inputsKey).reduce(
        (pv, value) => ({
            ...pv, 
            [value]: core.getInput(value, {required: false}) || undefined,
        }),
        {} as Record<InputsKey, string | undefined>
    )
);

const octokit = new Octokit({
    auth: inputs.GITHUB_TOKEN
});

const closedPullRequestCollection = await (
    async function getPullRequestTitles(page = 1): Promise<Awaited<ReturnType<typeof octokit.pulls.list>>["data"]>
    {
        const closedPullRequests = await octokit.pulls.list({
            owner: inputs.GITHUB_OWNER,
            repo: inputs.GITHUB_REPO,
            state: "closed",
            base: inputs.GITHUB_BRANCHE,
            per_page: inputs.PER_PAGE,
            page: page,
        });

        if(closedPullRequests.data.length === inputs.PER_PAGE) {
            return [...await getPullRequestTitles(page + 1), ...closedPullRequests.data];
        }
        else {
            return closedPullRequests.data;
        }
    }
)();

const mergedPullRequestTitleCollection = closedPullRequestCollection
    .filter(pullRequest => !!pullRequest.merged_at)
    .sort((a, b) => Date.parse(a.merged_at || "") - Date.parse(b.merged_at || ""))
    .map(pullRequest => pullRequest.title);

let major = inputs.MAJOR_START_AT;
let minor = inputs.MINOR_START_AT;
let patch = inputs.PATCH_START_AT;
for(const title of mergedPullRequestTitleCollection){
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

core.setOutput(
    "COMPUTED_VERSION", 
    inputs.OUTPUT_FORMAT
        .replace("{MAJOR}", major.toString())
        .replace("{MINOR}", minor.toString())
        .replace("{PATCH}", patch.toString())
);
