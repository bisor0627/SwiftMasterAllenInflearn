// .github/scripts/update-milestones-and-issues-from-yaml.js
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { execSync } = require("child_process");

const issuesYamlPath = path.resolve(".github/plans/issues.yaml");
const milestonesYamlPath = path.resolve(".github/plans/milestones.yaml");

const issuesYaml = yaml.load(fs.readFileSync(issuesYamlPath, "utf-8"));
const milestonesYaml = yaml.load(fs.readFileSync(milestonesYamlPath, "utf-8"));

// ===== 업데이트할 이슈 데이터 준비 =====
// const allIssues = JSON.parse(
//   execSync("gh issue list --state all --json number,title", { encoding: "utf-8" })
// );
// const titleToNumber = Object.fromEntries(allIssues.map((i) => [i.title, i.number]));
// const numberToTitle = Object.fromEntries(allIssues.map((i) => [i.number, i.title]));

// issuesYaml.forEach((yamlIssue) => {
//   const { number, title, body } = yamlIssue;
//   let issueNumber = number;

//   if (!issueNumber && titleToNumber[title]) {
//     issueNumber = titleToNumber[title];
//   }

//   if (!issueNumber) {
//     console.warn(`⚠️ 해당 이슈 없음 (title/number 모두 매칭 불가): ${title}`);
//     return;
//   }

//   let current;
//   try {
//     current = JSON.parse(
//       execSync(`gh issue view ${issueNumber} --json title,body`, { encoding: "utf-8" })
//     );
//   } catch (err) {
//     console.error(`❌ 이슈 조회 실패 (#${issueNumber}):`, err.message);
//     return;
//   }

//   const needsTitleUpdate = current.title !== title;
//   const needsBodyUpdate = current.body?.trim() !== (body ?? "").trim();

//   if (!needsTitleUpdate && !needsBodyUpdate) {
//     console.log(`⏩ 변경 없음: #${issueNumber} (${title})`);
//     return;
//   }

//   const args = [`gh issue edit ${issueNumber}`];
//   if (needsTitleUpdate) args.push(`--title \"${title}\"`);
//   if (needsBodyUpdate) args.push(`--body \"${body}\"`);

//   try {
//     console.log(`✏️ 업데이트: #${issueNumber} → ${needsTitleUpdate ? "📝 제목" : ""} ${needsBodyUpdate ? "📄 본문" : ""}`);
//     execSync(args.join(" "), { stdio: "inherit" });
//   } catch (err) {
//     console.error(`❌ 업데이트 실패 (#${issueNumber})`, err.message);
//   }
// });
// ===== 마일스톤 업데이트 =====
const existingMilestones = JSON.parse(
  execSync("gh api repos/:owner/:repo/milestones --jq '.' --paginate", { encoding: "utf-8" })
);

const titleToMilestone = Object.fromEntries(
  existingMilestones.map((m) => [m.title, m])
);
const numberToMilestone = Object.fromEntries(
  existingMilestones.map((m) => [m.number, m])
);
milestonesYaml.forEach(({ number, title, description, due }) => {
  let milestone = number ? numberToMilestone[number] : titleToMilestone[title];

  if (!milestone) {
    console.warn(`⚠️ 해당 마일스톤 없음 (title/number 모두 매칭 불가): ${title || number}`);
    return;
  }

  const needsTitleUpdate = milestone.title !== title;
  const needsDescriptionUpdate = milestone.description?.trim() !== (description ?? "").trim();
  const needsDueUpdate = milestone.due_on?.slice(0, 10) !== due;

  if (!needsTitleUpdate && !needsDescriptionUpdate && !needsDueUpdate) {
    console.log(`⏩ 변경 없음: 마일스톤 '${milestone.title}'`);
    return;
  }

  const args = [
    `gh api --method PATCH repos/:owner/:repo/milestones/${milestone.number}`
  ];
  if (needsTitleUpdate) args.push(`-f title='${title}'`);
  if (needsDescriptionUpdate) args.push(`-f description='${description}'`);
  if (needsDueUpdate) args.push(`-f due_on='${due}T23:59:59Z'`);

  try {
    console.log(`✏️ 마일스톤 업데이트: #${milestone.number} → ${[
      needsTitleUpdate ? "📝 제목" : "",
      needsDescriptionUpdate ? "📄 설명" : "",
      needsDueUpdate ? "⏰ 마감일" : ""
    ].filter(Boolean).join(" / ")}`);
    execSync(args.join(" "), {
      stdio: "inherit",
      env: { ...process.env, EDITOR: "true" }
    });
  } catch (err) {
    console.error(`❌ 마일스톤 업데이트 실패 (${title})`, err.message);
  }
});