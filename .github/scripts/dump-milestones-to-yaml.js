// .github/scripts/dump-milestones-to-yaml.js
const fs = require("fs");
const yaml = require("js-yaml");
const { execSync } = require("child_process");
const path = require("path");

const outputPath = path.resolve(".github/plans/milestones.yaml");

const milestones = JSON.parse(
  execSync("gh api repos/:owner/:repo/milestones --paginate", {
    encoding: "utf-8",
  })
);

// 🔽 정렬 (오래된 순서대로 보기 좋게)
milestones.sort((a, b) => new Date(a.due_on) - new Date(b.due_on));

// 모든 이슈 정보 가져오기
const allIssues = JSON.parse(
  execSync("gh issue list --state all --json number,title,body,milestone", {
    encoding: "utf-8",
  })
);

// 마일스톤 번호로 이슈 그룹핑
const milestoneToIssues = {};
allIssues.forEach((issue) => {
  if (!issue.milestone) return;
  const milestoneNumber = issue.milestone.number;
  if (!milestoneToIssues[milestoneNumber]) {
    milestoneToIssues[milestoneNumber] = [];
  }
  milestoneToIssues[milestoneNumber].push({
    issue_title: issue.title,
    body: issue.body || "",
  });
});

const yamlData = milestones.map((m) => {
  const data = {
    number: m.number,
    title: m.title,
    description: m.description || "",
    due: m.due_on ? m.due_on.split("T")[0] : "",
  };

  const relatedIssues = milestoneToIssues[m.number] || [];
  if (relatedIssues.length) {
    data.days = relatedIssues.map((issue, idx) => ({
      day: idx + 1,
      issue_title: issue.issue_title,
      body: issue.body.trim(),
    }));
  }

  return data;
});

fs.writeFileSync(outputPath, yaml.dump(yamlData, { noRefs: true, lineWidth: -1 }));
console.log(`📦 마일스톤 ${yamlData.length}개를 YAML로 저장했습니다: ${outputPath}`);
