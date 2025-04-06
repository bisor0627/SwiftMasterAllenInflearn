// scripts/generate-milestones.js
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const yaml = require("js-yaml");

const filePath = path.join(__dirname, "../plans/milestones.yaml");
const milestones = yaml.load(fs.readFileSync(filePath, "utf-8"));

console.log("📥 기존 마일스톤 목록 조회 중...");
const existing = JSON.parse(
  execSync("gh api repos/:owner/:repo/milestones", { encoding: "utf-8" })
);

const existingTitles = new Set(existing.map((m) => m.title));

milestones.forEach(({ title, description, due_on }) => {
  if (existingTitles.has(title)) {
    console.log(`⚠️ 이미 존재하는 마일스톤: ${title} → 생성 스킵`);
    return;
  }

  console.log(`📌 생성 시도: ${title}`);
  try {
    execSync(
      `gh api repos/:owner/:repo/milestones \
      -f title='${title}' \
      -f description='${description}' \
      -f due_on='${due_on}T23:59:59Z'`,
      { stdio: "inherit" }
    );
  } catch (err) {
    console.error(`❌ 마일스톤 생성 실패: ${title}`, err.message);
  }
});