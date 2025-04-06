#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { execSync } = require("child_process");

const issuesYaml = fs.readFileSync(path.resolve(".github/plans/issues.yaml"), "utf-8");
const issues = yaml.load(issuesYaml);

// GitHub 이슈 목록 + 현재 마일스톤 정보 포함해서 가져오기
const allIssues = JSON.parse(
  execSync("gh issue list --state all --json number,title,milestone", { encoding: "utf-8" })
);

const titleToIssueInfo = {};
allIssues.forEach((issue) => {
  titleToIssueInfo[issue.title] = {
    number: issue.number,
    currentMilestone: issue.milestone ? issue.milestone.title : null,
  };
});

for (const { title, milestone: targetMilestone } of issues) {
  const info = titleToIssueInfo[title];
  if (!info || !targetMilestone) continue;

  const { number, currentMilestone } = info;

  // 이미 마일스톤이 같으면 스킵
  if (currentMilestone === targetMilestone) {
    console.log(`⏭️ 스킵: #${number} - "${title}" (이미 "${targetMilestone}")`);
    continue;
  }

  try {
    console.log(`📌 이슈 #${number} → 마일스톤 "${targetMilestone}"`);
    execSync(`gh issue edit ${number} --milestone "${targetMilestone}"`, {
      stdio: "inherit",
      env: { ...process.env, EDITOR: "true" },
    });
  } catch (err) {
    console.error(`❌ 실패: 이슈 #${number}`, err.message);
  }
}