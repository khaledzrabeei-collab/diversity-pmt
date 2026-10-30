// Read-only comparison against the inspected legacy export functions. No imports to the app.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'references/private/exports-2026-10-31');
const model = require(path.join(root, 'references/private/legacy-checks/lib/model.js'));
const indicators = require(path.join(root, 'references/private/legacy-checks/lib/indicator-domain.js'));
const { projectReport } = require(path.join(root, 'references/private/legacy-checks/lib/project-export.js'));
const read = name => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8').replace(/^\uFEFF/, ''));
const backup = read('Diversity-PMT-backup (3).json');
const extracted = read('xlsx-extracted.json');
const csv = read('csv-extracted.json');
const workspace = backup.workspace;
const project = workspace.projects.find(p => p.code === 'CBPF-YEM-25-S-NGO-37744');
if (!project) throw new Error('Expected project missing; review source scope.');
const before = crypto.createHash('sha256').update(JSON.stringify(workspace)).digest('hex');
const month = '2026-10';
const normalizedText = text => text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\n$/, '');
const csvResults = Object.keys(csv).map(name => {
  const generated = name.includes('Approved-results') ? indicators.indicatorApprovedCsv(project, month) : indicators.indicatorCsv(project, month);
  return { file: name, dataRows: csv[name].length - 1, matchIgnoringBomAndLineEndings: normalizedText(generated) === normalizedText(fs.readFileSync(path.join(dir, name), 'utf8')) };
});
const summary = extracted.sheets.find(s => s.name === 'Project summary');
const value = ref => summary.rows.flatMap(r => r.cells).find(c => c.ref === ref)?.value;
// Version is recorded from the workbook; time placeholders are excluded from comparison.
const version = value('C12');
const savedAt = backup.exportedAt;
const expected = projectReport(project, month, version, savedAt, new Date(backup.exportedAt), value('C27'));
function column(n) { let s = ''; for (n++; n; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + (n - 1) % 26) + s; return s; }
const clean = v => v === null || v === undefined ? '' : v;
const same = (a,b) => clean(a) === clean(b);
const xlsxResults = expected.sheets.map(sheet => {
  const actual = extracted.sheets.find(s => s.name === sheet.name);
  const actualCells = new Map(actual.rows.flatMap(r => r.cells).map(c => [c.ref,c.value]));
  const seen = new Set(), mismatches = [], excluded = [], compared = [];
  sheet.rows.forEach((row,ri) => row.cells.forEach((cell,ci) => {
    const ref = column(ci)+(ri+1); seen.add(ref);
    // These metadata values have no independently verifiable counterpart in the backup.
    if (sheet.name === 'Project summary' && ['C10','C11','C12','C27'].includes(ref)) {excluded.push(ref); return;}
    compared.push(ref);
    if (!same(cell.value,actualCells.get(ref))) mismatches.push({ref,expected:clean(cell.value),actual:clean(actualCells.get(ref))});
  }));
  for (const [ref,val] of actualCells) if (!seen.has(ref) && clean(val) !== '') mismatches.push({ref,expected:'',actual:val});
  return {sheet:sheet.name,actualRows:actual.rows.length,expectedRows:sheet.rows.length,comparedCells:compared.length,excludedMetadataCells:excluded,mismatchCount:mismatches.length,mismatches};
});
const states = {}, issues = {}, structural = {};
for (const i of project.indicators) {
  const state = indicators.indicatorReportState(i.monthly[month]); states[state] = (states[state] || 0) + 1;
  for (const item of indicators.indicatorSubmissionIssues(i,project,month,'2026-10-31')) issues[item] = (issues[item] || 0) + 1;
}
for (const name of Object.keys(csv).filter(n => !n.includes('Approved'))) {
  const rows = csv[name], checks = rows[0].indexOf('Checks');
  for (const row of rows.slice(1)) for (const issue of row[checks].split('; ').filter(Boolean)) structural[issue] = (structural[issue] || 0) + 1;
  break; // duplicates are not additional evidence
}
const oct = project.indicators.map(i => i.monthly[month]);
const tasks = project.tasks;
const taskIds = new Set(tasks.map(t=>t.id));
const sourceShape = {};
for (const key of ['indicators','budget','procurement']) {
  const sources = project[key].map(r=>r.source).filter(Boolean);
  const formulas = sources.flatMap(s=>Object.values(s.formulas||{}));
  sourceShape[key] = {withSource:sources.length,withoutSource:project[key].length-sources.length,sourceKeys:[...new Set(sources.flatMap(s=>Object.keys(s)))],preservedFormulaEntries:formulas.length,bareEqualsEntries:formulas.filter(f=>String(f).trim()==='=').length};
}
const financialKeys = ['actual','accrual','pendingPO','forecast','totalForecast','remaining','variance'];
const financial = Object.fromEntries(financialKeys.map(key=>[key,project.budget.reduce((total,b)=>total+model.budgetStats(b,month)[key],0)]));
financial.budget = project.budget.reduce((total,b)=>total+b.budget,0);
const result = {
  reportMonth:month,backupExportedAt:backup.exportedAt,workbookSavedRecordVersion:version,backupIncludesSavedVersion:Object.hasOwn(backup,'version'),
  csv:csvResults,xlsx:xlsxResults,
  octoberIndicatorStates:states,octoberReported:oct.filter(indicators.indicatorReported).length,
  octoberConfirmedZero:oct.filter(r=>indicators.indicatorReported(r)&&r.achieved===0).length,
  octoberExplicitPlans:oct.filter(indicators.indicatorPlanSet).length,
  csvChecks:structural,submissionIssues:issues,
  unresolvedIndicatorReviews:project.indicators.filter(i=>i.review&&!i.reviewResolution).length,
  indicatorsWithoutExplicitMeasure:project.indicators.filter(i=>i.measure===undefined).length,
  reportBaselineExists:!!project.planner?.baseline,
  jiraBaselineLockedTasks:tasks.filter(t=>t.jira?.baselineLocked).length,
  procurementUnknownLeadTime:project.procurement.filter(p=>p.leadTimeKnown===false).length,
  procurementMissingRequiredDate:project.procurement.filter(p=>!p.requiredDate).length,
  procurementMissingTaskLink:project.procurement.filter(p=>!p.taskId).length,
  procurementDanglingTaskLinks:project.procurement.filter(p=>p.taskId&&!taskIds.has(p.taskId)).length,
  budgetForecastModes:[...new Set(project.budget.map(b=>b.forecastMode??'standard'))],sourceShape,
  observedLegacyBudgetTotals:financial,
  recordedImportBudgetSummary:project.importInfo?.summaryBudget,
  originalSourceFiles:project.importInfo?.files?.map(({name,sha256})=>({name,sha256})),
  importCounts:project.importInfo?.counts,
  recordedImportWarnings:project.importInfo?.warnings,
  backupObjectUnchanged:crypto.createHash('sha256').update(JSON.stringify(workspace)).digest('hex')===before,
  note:'Parsed cell values compared exactly; null/absent/empty cells normalized to blank. No financial rounding or formula policy inferred.'
};
fs.writeFileSync(path.join(dir,'reconciliation.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
if (!result.backupObjectUnchanged || csvResults.some(r=>!r.matchIgnoringBomAndLineEndings) || xlsxResults.some(r=>r.mismatchCount || r.actualRows!==r.expectedRows)) process.exitCode = 1;
