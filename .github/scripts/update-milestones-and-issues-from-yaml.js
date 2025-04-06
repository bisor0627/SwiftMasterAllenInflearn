// .github/scripts/update-milestones-and-issues-from-yaml.js
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { execSync } = require("child_process");

const issuesYaml = path.resolve(".github/plans/issues.yaml");
const milestonesYaml = path.resolve(".github/plans/milestones.yaml");

const issues = yaml.load(fs.readFileSync(issuesYaml, "utf-8"));
const milestones = yaml.load(fs.readFileSync(milestonesYaml, "utf-8"));

// 현재 연결된 GitHub 저장소 정보 가져오기
const repoInfo = JSON.parse(execSync("gh repo view --json owner,name", { encoding: "utf-8" }));
const owner = repoInfo.owner.login;
const repo = repoInfo.name;

// GitHub에 존재하는 이슈 목록
const existingIssues = JSON.parse(
  execSync(`gh issue list --state all --json number,title`, { encoding: "utf-8" })
);
const titleToNumberMap = Object.fromEntries(
  existingIssues.map((issue) => [issue.title, issue.number])
);

// 📌 이슈 업데이트
issues.forEach(({ title, body }) => {
  const number = titleToNumberMap[title];
  if (!number) {
    console.warn(`⚠️ 해당 이슈 없음: ${title}`);
    return;
  }

  try {
    console.log(`✏️ 이슈 #${number} 내용 업데이트: ${title}`);
    execSync(`gh issue edit ${number} --body \"${body}\"`, { stdio: "inherit" });
  } catch (err) {
    console.error(`❌ 이슈 수정 실패: #${number}`, err.message);
  }
});

// GitHub에 존재하는 마일스톤 목록
const existingMilestones = JSON.parse(
  execSync(`gh api repos/${owner}/${repo}/milestones`, { encoding: "utf-8" })
);
const titleToMilestoneIdMap = Object.fromEntries(
  existingMilestones.map((ms) => [ms.title, ms.number])
);

// 📌 마일스톤 업데이트
milestones.forEach(({ title, description, due }) => {
  const milestoneId = titleToMilestoneIdMap[title];
  if (!milestoneId) {
    console.warn(`⚠️ 해당 마일스톤 없음: ${title}`);
    return;
  }

  try {
    console.log(`✏️ 마일스톤 #${milestoneId} 내용 업데이트: ${title}`);
    execSync(
      `gh api -X PATCH repos/${owner}/${repo}/milestones/${milestoneNumber} \
      --silent \
      -f title="${title}" \
      -f description="${description}" \
      -f due_on="${due_on}T23:59:59Z"`,
      { stdio: "inherit" }
    );
  } catch (err) {
    console.error(`❌ 마일스톤 수정 실패: #${milestoneId}`, err.message);
  }
});

console.log("✅ 이슈 및 마일스톤 동기화 완료");
