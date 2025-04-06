const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

const README_PATH = path.resolve("README.md");

const milestones = JSON.parse(execSync("gh api repos/:owner/:repo/milestones").toString());
let total = 0, closed = 0;

milestones.forEach((ms) => {
  total += ms.open_issues + ms.closed_issues;
  closed += ms.closed_issues;
});

const percent = Math.round((closed / total) * 100);
const updated = fs.readFileSync(README_PATH, "utf-8")
  .replace(/(Currently-[^)]*\))/, `Currently-${percent}%25-blue)`);

fs.writeFileSync(README_PATH, updated);
console.log(`✅ 진행률 업데이트 완료 (${percent}%)`);