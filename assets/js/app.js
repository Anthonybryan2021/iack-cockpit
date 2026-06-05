const state = {
  current: null,
  history: [],
  changelog: [],
  activeScreen: "overview",
  theme: "dark"
};

const els = {
  root: document.documentElement,
  topbarTitle: document.getElementById("topbar-title"),
  topbarSubtitle: document.getElementById("topbar-subtitle"),
  themeToggle: document.getElementById("theme-toggle"),
  navButtons: () => document.querySelectorAll(".nav-button"),
  screens: () => document.querySelectorAll(".screen"),
  overview: document.getElementById("overview-content"),
  validation: document.getElementById("validation-content"),
  integrity: document.getElementById("integrity-content"),
  reports: document.getElementById("reports-content")
};

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  return response.json();
}

async function loadData() {
  const [current, history, changelog] = await Promise.all([
    loadJson("./assets/data/current-metrics.json?v=5"),
    loadJson("./assets/data/validation-history.json?v=5"),
    loadJson("./assets/data/formula-changelog.json?v=5")
  ]);

  state.current = current;
  state.history = Array.isArray(history) ? history : [history];
  state.changelog = Array.isArray(changelog) ? changelog : [changelog];
}

function badgeClass(status) {
  if (status === "good" || status === "Passed") return "good";
  if (status === "warning") return "warning";
  return "danger";
}

function setTheme(theme) {
  state.theme = theme;
  els.root.setAttribute("data-theme", theme);
  if (els.themeToggle) {
    els.themeToggle.textContent = theme === "dark" ? "Light mode" : "Dark mode";
  }
}

function bindThemeToggle() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(prefersDark ? "dark" : "light");

  if (els.themeToggle) {
    els.themeToggle.addEventListener("click", () => {
      setTheme(state.theme === "dark" ? "light" : "dark");
    });
  }
}

function setActiveScreen(screenId) {
  state.activeScreen = screenId;

  els.navButtons().forEach((button) => {
    button.classList.toggle("active", button.dataset.screen === screenId);
  });

  els.screens().forEach((screen) => {
    screen.classList.toggle("active", screen.id === `screen-${screenId}`);
  });

  const titles = {
    overview: ["Overview", "Current IACK posture, changes, and next actions."],
    validation: ["Validation Lab", "Run validation scenarios and inspect execution results."],
    integrity: ["Integrity", "Review drift, exceptions, and artifact-level integrity status."],
    reports: ["Reports", "Generate executive, technical, and research-facing summaries."]
  };

  els.topbarTitle.textContent = titles[screenId][0];
  els.topbarSubtitle.textContent = titles[screenId][1];
}

function renderOverview() {
  const data = state.current.overview;

  els.overview.innerHTML = `
    <div class="card-grid">
      <article class="card">
        <div class="eyebrow">Overall IACK Score</div>
        <div class="value kpi-score">${data.iackScore}</div>
        <div class="support">Framework posture score</div>
        <div class="delta">${data.scoreDelta}</div>
      </article>

      <article class="card">
        <div class="eyebrow">Validation Status</div>
        <div class="value">${data.validationStatus}</div>
        <div class="support">Latest live outcome</div>
      </article>

      <article class="card">
        <div class="eyebrow">Confidence</div>
        <div class="value">${data.confidence}</div>
        <div class="support">Current scoring confidence</div>
      </article>

      <article class="card">
        <div class="eyebrow">Open Findings</div>
        <div class="value">${data.openFindings}</div>
        <div class="support">Items needing follow-up</div>
      </article>
    </div>

    <div class="card-grid two">
      <article class="card">
        <div class="section-heading">
          <h3>Pillar Scores</h3>
          <p>Current status across the IACK model.</p>
        </div>
        <div class="pillar-list">
          ${data.pillars.map(pillar => `
            <div class="pillar-item">
              <div>
                <strong>${pillar.name}</strong>
                <span class="badge ${badgeClass(pillar.status)}">${pillar.status}</span>
              </div>
              <div style="min-width: 160px;">
                <div>${pillar.score}/100</div>
                <div class="progress"><span style="width:${pillar.score}%"></span></div>
              </div>
            </div>
          `).join("")}
        </div>
      </article>

      <article class="card">
        <div class="section-heading">
          <h3>What Changed</h3>
          <p>Most recent movements in the framework state.</p>
        </div>
        <ul class="list">
          ${data.changes.map(item => `<li class="list-item">${item}</li>`).join("")}
        </ul>
        <div class="action-row">
          <span class="badge ${badgeClass(data.validationStatus)}">${data.validationStatus}</span>
          <small class="muted">Last run: ${data.lastRun}</small>
        </div>
      </article>
    </div>

    <div class="card">
      <div class="section-heading">
        <h3>Recommended Next Action</h3>
        <p>Use the cockpit to move from observation into action.</p>
      </div>
      <p>${data.nextAction}</p>
    </div>
  `;
}

function renderValidation() {
  const data = state.current.validationLab;
  const historyRows = state.history.slice().reverse().map(item => `
    <tr>
      <td>${item.timestamp}</td>
      <td>${item.runId}</td>
      <td>${item.score}</td>
      <td>${item.validationStatus}</td>
      <td>${item.testsPassed}/${item.testsPassed + item.testsFailed}</td>
      <td>${item.duration}</td>
    </tr>
  `).join("");

  els.validation.innerHTML = `
    <div class="card-grid">
      <article class="card">
        <div class="eyebrow">Dataset</div>
        <div class="value value-sm">${data.activeDataset}</div>
        <div class="support">Active validation source</div>
      </article>

      <article class="card">
        <div class="eyebrow">Run ID</div>
        <div class="value value-sm">${data.runId}</div>
        <div class="support">Tracked execution identifier</div>
      </article>

      <article class="card">
        <div class="eyebrow">Duration</div>
        <div class="value">${data.duration}</div>
        <div class="support">Most recent run time</div>
      </article>

      <article class="card">
        <div class="eyebrow">Pass / Fail</div>
        <div class="value">${data.testsPassed}/${data.testsPassed + data.testsFailed}</div>
        <div class="support">Checks completed this cycle</div>
      </article>
    </div>

    <div class="card-grid two">
      <article class="card">
        <div class="section-heading">
          <h3>Validation Summary</h3>
          <p>Scenario, execution context, and current run status.</p>
        </div>
        <div class="stack">
          <div class="summary-row"><span class="summary-label">Scenario</span><strong>${data.scenario}</strong></div>
          <div class="summary-row"><span class="summary-label">Status</span><span class="badge good">Passed</span></div>
          <div class="summary-row"><span class="summary-label">Tests Passed</span><strong>${data.testsPassed}</strong></div>
          <div class="summary-row"><span class="summary-label">Tests Failed</span><strong>${data.testsFailed}</strong></div>
        </div>
      </article>

      <article class="card">
        <div class="section-heading">
          <h3>Execution Log</h3>
          <p>Current validation run output.</p>
        </div>
        <div class="console">${data.logLines.join("\n")}</div>
      </article>
    </div>

    <article class="card">
      <div class="section-heading">
        <h3>Validation History</h3>
        <p>Recent runs captured from the synced metrics workflow.</p>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Run ID</th>
              <th>Score</th>
              <th>Status</th>
              <th>Tests</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            ${historyRows}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

function renderIntegrity() {
  const data = state.current.integrity;

  els.integrity.innerHTML = `
    <div class="card-grid">
      <article class="card">
        <div class="eyebrow">Integrity Score</div>
        <div class="value kpi-score">${data.score}</div>
        <div class="support">Current pillar rating</div>
      </article>

      <article class="card">
        <div class="eyebrow">Drift Events</div>
        <div class="value">${data.driftEvents}</div>
        <div class="support">Recent detected changes</div>
      </article>

      <article class="card">
        <div class="eyebrow">Verified Artifacts</div>
        <div class="value">${data.verifiedArtifacts}</div>
        <div class="support">Validated items in latest cycle</div>
      </article>

      <article class="card">
        <div class="eyebrow">Exceptions</div>
        <div class="value">${data.exceptions}</div>
        <div class="support">Items requiring review</div>
      </article>
    </div>

    <div class="card-grid two">
      <article class="card">
        <div class="section-heading">
          <h3>Integrity Summary</h3>
          <p>Interpretation of the current integrity posture.</p>
        </div>
        <p>${data.summary}</p>
      </article>

      <article class="card">
        <div class="section-heading">
          <h3>Review Priorities</h3>
          <p>Immediate actions to stabilize the integrity pillar.</p>
        </div>
        <ul class="list">
          <li class="list-item">Re-run artifacts with threshold variance above baseline.</li>
          <li class="list-item">Document exceptions before the next release tag.</li>
          <li class="list-item">Align drift findings with validation evidence.</li>
        </ul>
      </article>
    </div>

    <article class="card">
      <div class="section-heading">
        <h3>Artifact Review Queue</h3>
        <p>Flagged items from the latest integrity analysis.</p>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Artifact</th>
              <th>Severity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.issues.map(issue => `
              <tr>
                <td>${issue.artifact}</td>
                <td>${issue.severity}</td>
                <td>${issue.status}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

function downloadText(filename, text, type = "text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function buildMarkdownReport() {
  const { overview, validationLab, integrity, reports } = state.current;
  const changelogSection = state.changelog.map(item =>
    `- ${item.timestamp} | ${item.metric} | ${item.change}`
  ).join("\n");

  return `# IACK Cockpit Report

## Overview
- Overall IACK Score: ${overview.iackScore}
- Validation Status: ${overview.validationStatus}
- Confidence: ${overview.confidence}
- Open Findings: ${overview.openFindings}
- Last Run: ${overview.lastRun}

## Validation Lab
- Dataset: ${validationLab.activeDataset}
- Scenario: ${validationLab.scenario}
- Run ID: ${validationLab.runId}
- Tests Passed: ${validationLab.testsPassed}
- Tests Failed: ${validationLab.testsFailed}
- Duration: ${validationLab.duration}

## Integrity
- Score: ${integrity.score}
- Drift Events: ${integrity.driftEvents}
- Verified Artifacts: ${integrity.verifiedArtifacts}
- Exceptions: ${integrity.exceptions}

### Integrity Summary
${integrity.summary}

## Formula Changelog
${changelogSection}

## Reports
### Executive Summary
${reports.executiveSummary}

### Technical Summary
${reports.technicalSummary}

### Research Summary
${reports.researchSummary}
`;
}

async function copyFindings() {
  const markdown = buildMarkdownReport();
  try {
    await navigator.clipboard.writeText(markdown);
    alert("Findings copied to clipboard.");
  } catch {
    alert("Clipboard copy failed. Use Export Summary instead.");
  }
}

function renderReports() {
  const data = state.current.reports;

  els.reports.innerHTML = `
    <article class="card" style="margin-bottom:22px;">
      <div class="section-heading">
        <h3>Executive Summary</h3>
        <p>High-level framing for leadership and external stakeholders.</p>
      </div>
      <div class="report-block">${data.executiveSummary}</div>
    </article>

    <div class="card-grid two">
      <article class="card">
        <div class="section-heading">
          <h3>Technical Summary</h3>
          <p>Operational notes for engineering and validation work.</p>
        </div>
        <div class="report-block">${data.technicalSummary}</div>
      </article>

      <article class="card">
        <div class="section-heading">
          <h3>Research Summary</h3>
          <p>Support for reproducibility and future academic framing.</p>
        </div>
        <div class="report-block">${data.researchSummary}</div>
      </article>
    </div>

    <div class="card-grid two">
      <article class="card">
        <div class="section-heading">
          <h3>Formula Changelog</h3>
          <p>Tracked metric updates now exposed in the cockpit.</p>
        </div>
        <ul class="list">
          ${state.changelog.map(item => `<li class="list-item"><strong>${item.metric}</strong>: ${item.change}</li>`).join("")}
        </ul>
      </article>

      <article class="card">
        <div class="section-heading">
          <h3>Export Targets</h3>
          <p>Structured outputs for the next documentation pass.</p>
        </div>
        <ul class="list">
          ${data.exports.map(item => `<li class="list-item">${item}</li>`).join("")}
        </ul>
      </article>
    </div>

    <article class="card">
      <div class="section-heading">
        <h3>Report Actions</h3>
        <p>Export current state as markdown.</p>
      </div>
      <div class="action-row">
        <button class="btn btn-primary" id="export-summary">Export Summary</button>
        <button class="btn btn-secondary" id="copy-findings">Copy Findings</button>
      </div>
    </article>
  `;

  const exportButton = document.getElementById("export-summary");
  const copyButton = document.getElementById("copy-findings");

  if (exportButton) {
    exportButton.addEventListener("click", () => {
      const markdown = buildMarkdownReport();
      downloadText("iack-cockpit-report.md", markdown, "text/markdown");
    });
  }

  if (copyButton) {
    copyButton.addEventListener("click", copyFindings);
  }
}

function bindNavigation() {
  els.navButtons().forEach((button) => {
    button.addEventListener("click", () => {
      setActiveScreen(button.dataset.screen);
    });
  });
}

async function init() {
  try {
    bindThemeToggle();
    await loadData();
    bindNavigation();
    renderOverview();
    renderValidation();
    renderIntegrity();
    renderReports();
    setActiveScreen("overview");
  } catch (error) {
    document.body.innerHTML = `
      <main style="padding: 40px; color: white; font-family: Segoe UI, sans-serif;">
        <h1>IACK Cockpit</h1>
        <p>Failed to load local dashboard data.</p>
        <pre>${error.message}</pre>
      </main>
    `;
  }
}

init();
