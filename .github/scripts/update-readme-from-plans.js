const fs = require("fs");
const yaml = require("js-yaml");
const path = require("path");

const readmePath = path.resolve("README.md");
const milestoneYaml = path.resolve(".github/plans/milestones.yaml");
const issueYaml = path.resolve(".github/plans/issues.yaml");

const milestones = yaml.load(fs.readFileSync(milestoneYaml, "utf-8")) || [];
const issues = yaml.load(fs.readFileSync(issueYaml, "utf-8")) || [];

const weekMap = {};

issues.forEach((issue) => {
  const week = issue.milestone;
  if (!weekMap[week]) weekMap[week] = [];
  weekMap[week].push(`- [ ] ${issue.title}`);
});

let content = "\n### ✅ 주간 계획\n\n";
milestones.forEach(({ title }) => {
  content += `#### ${title}\n`;
  content += weekMap[title] ? weekMap[title].join("\n") + "\n\n" : "(아직 이슈 없음)\n\n";
  });

const readme = fs.readFileSync(readmePath, "utf-8");
const replaced = readme.replace(/### ✅ 주간 계획([\\s\\S]*?)(?=###|$)/, content.trim());
fs.writeFileSync(readmePath, replaced);
console.log("📘 README의 주간 계획이 YAML 기반으로 재작성되었습니다.");