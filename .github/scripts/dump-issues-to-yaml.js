#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { execSync } = require("child_process");

const OUT_PATH = path.resolve(".github/plans/issues.yaml");

console.log("📥 GitHub 이슈 가져오는 중...");

const issues = JSON.parse(
  execSync(
    `gh issue list --state all --limit 1000 --json number,title,body,labels,milestone`,
    { encoding: "utf-8" }
  )
);

const simplified = issues.map((issue) => ({
  number: issue.number,
  title: issue.title,
  body: issue.body || "",
  milestone: issue.milestone?.title || null,
  labels: issue.labels?.map((l) => l.name) || [],
}));

fs.writeFileSync(OUT_PATH, yaml.dump(simplified, { lineWidth: -1 }), "utf-8");
console.log(`✅ ${OUT_PATH} 에 YAML 형식으로 이슈 덤프 완료!`);