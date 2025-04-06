// scripts/generate-issues.js
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { execSync } = require("child_process");

const issuesYaml = path.join(__dirname, "../plans/issues.yaml");
const issues = yaml.load(fs.readFileSync(issuesYaml, "utf-8"));

// 1. 현재 열려있는 이슈들을 가져옴 (closed 제외)
console.log("📥 기존 이슈 목록 조회 중...");
const existing = JSON.parse(
  execSync("gh issue list --state open --json title", { encoding: "utf-8" })
);
const existingTitles = new Set(existing.map((issue) => issue.title));

issues.forEach(({ title, body, labels }) => {
  if (existingTitles.has(title)) {
    console.log(`⚠️ 이미 존재하는 이슈: ${title} → 생성 스킵`);
    return;
  }

  console.log(`🔧 Creating issue: ${title}`);
  const labelString = (labels || []).map((l) => `--label "${l}"`).join(" ");

  try {
    execSync(
      `gh issue create --title "${title}" --body "${body}" ${labelString}`,
      { stdio: "inherit" }
    );
  } catch (error) {
    console.error(`❌ Failed to create issue for ${title}`, error.message);
  }
});