#!/usr/bin/env node
const fs = require("fs");
const yaml = require("js-yaml");
const { execSync } = require("child_process");

const issuesYaml = fs.readFileSync("../plans/issues.yaml", "utf-8");
const issues = yaml.load(issuesYaml);

const allIssues = JSON.parse(execSync("gh issue list --state all --json number,title", { encoding: "utf-8" }));

const titleToNumber = {};
allIssues.forEach((issue) => {
  titleToNumber[issue.title] = issue.number;
});

for (const issue of issues) {
  const issueNumber = issue.number || titleToNumber[issue.title];
  if (!issueNumber || !issue.milestone) continue;

  console.log(`📌 이슈 #${issueNumber} → 마일스톤 "${issue.milestone}"`);
  try {
    execSync(`gh issue edit ${issueNumber} --milestone "${issue.milestone}"`, {
      stdio: "inherit",
    });
  } catch (err) {
    console.error(`❌ 실패: 이슈 #${number}`, err.message);
  }
}