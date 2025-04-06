✅ 1. 워크플로우 실행 순서

💡 가장 추천되는 자동화 순서:

| 목적                     | 트리거                          | 실행 내용                                   |
|--------------------------|---------------------------------|--------------------------------------------|
| ✅ 마일스톤 생성          | 수동 (workflow_dispatch)        | `node .github/scripts/generate-milestones.js`      |
| ✅ 이슈 생성              | 수동 (workflow_dispatch)        | `node .github/scripts/generate-issues.js`          |
| ✅ 마일스톤에 이슈 할당   | 수동 (workflow_dispatch)        | `node .github/scripts/assign-issues-to-milestones.js` |
| ✅ README 갱신 (계획 기준) | `plans/` 변경 시                | `update-readme-from-plans.js`              |
| ✅ 체크리스트 체크        | 이슈가 closed 되면              | `update-checklist.js`                      |
| ✅ 진행률 배지 갱신       | closed, reopened, opened or 시간별 | `update-progress-badge.js`                 |
