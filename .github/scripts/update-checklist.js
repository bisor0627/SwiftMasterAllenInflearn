const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const readmePath = path.resolve("README.md");
const readme = fs.readFileSync(readmePath, "utf-8");
const issues = JSON.parse(execSync("gh issue list --state all --json title,state").toString());

let updatedReadme = readme;

for (const issue of issues) {
  const { title, state } = issue;
  const checkboxUnchecked = `- [ ] ${title}`;
  const checkboxChecked = `- [x] ${title}`;

  if (state === "CLOSED" && updatedReadme.includes(checkboxUnchecked)) {
    updatedReadme = updatedReadme.replace(checkboxUnchecked, checkboxChecked);
    console.log(`✅ ${title} 체크됨`);
  }
}

if (updatedReadme !== readme) {
  fs.writeFileSync(readmePath, updatedReadme);
  console.log("README.md 체크리스트 업데이트 완료 ✅");
} else {
  console.log("변경 사항 없음 🙅‍♀️");
}
