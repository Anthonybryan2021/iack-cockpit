const state = {
  data: null,
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

async function loadData() {
  const response = await fetch("./assets/data/mock-data.json?v=4");
  if (!response.ok) {
    throw new Error("Could not load mock data.");
  }
  state.data = await response.json();
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
  const data = state.data.overview;

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
        <div class="support">Latest run outcome</div>
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
  const data = state.data.validationLab;

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
          <div class="summary-row">
            <span class="summary-label">Scenario</span>
            <strong>${data.scenario}</strong>
          </div>
          <div class="summary-row">
            <span class="summary-label">Status</span>
            <span class="badge good">Passed</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Tests Passed</span>
            <strong>${data.testsPassed}</strong>
          </div>
          <div class="summary-row">
            <span class="summary-label">Tests Failed</span>
            <strong>${data.testsFailed}</strong>
          </div>
        </div>
        <div class="action-row">
          <button class="btn btn-primary" id="simulate-run">Run Validation</button>
          <button class="btn btn-secondary" id="compare-runs">Compare Runs</button>
        </div>
      </article>

      <article class="card">
        <div class="section-heading">
          <h3>Run Metadata</h3>
          <p>Static MVP placeholders for reproducibility and CI alignment.</p>
        </div>
        <ul class="list">
          <li class="list-item"><strong>Version:</strong> IACK v0.2.0-prep</li>
          <li class="list-item"><strong>Operator:</strong> Felix local workstation</li>
          <li class="list-item"><strong>Mode:</strong> Static MVP simulation</li>
          <li class="list-item"><strong>CI target:</strong> GitHub Actions integration next</li>
        </ul>
      </article>
    </div>

    <div class="card-grid two">
      <article class="card">
        <div class="section-heading">
          <h3>Run Queue</h3>
          <p>Near-term pipeline stages for validation maturation.</p>
        </div>
        <ul class="list">
          <li class="list-item">Baseline dataset verification</li>
          <li class="list-item">Metric threshold regression review</li>
          <li class="list-item">Artifact drift replay test</li>
          <li class="list-item">Markdown report export validation</li>
        </ul>
      </article>

      <article class="card">
        <div class="section-heading">
          <h3>Observed Conditions</h3>
          <p>Signals worth reviewing before the next tagged release.</p>
        </div>
        <ul class="list">
          <li class="list-item">Integrity variance exceeded expected threshold.</li>
          <li class="list-item">Reproducibility notes were captured successfully.</li>
          <li class="list-item">Report generation block completed with no fatal errors.</li>
        </ul>
      </article>
    </div>

    <article class="card">
      <div class="section-heading">
        <h3>Execution Log</h3>
        <p>Live validation output placeholder for future metric_validation.py integration.</p>
      </div>
      <div class="console" id="validation-console">${data.logLines.join("\n")}</div>
    </article>
  `;

  const runButton = document.getElementById("simulate-run");
  const compareButton = document.getElementById("compare-runs");
  const consoleBox = document.getElementById("validation-console");

  if (runButton && consoleBox) {
    runButton.addEventListener("click", () => {
      const extraLines = [
        "[INFO] Re-running validation workflow",
        "[INFO] Refreshing metric thresholds",
        "[INFO] Recomputing integrity confidence",
        "[PASS] Console state updated",
        "[DONE] Validation Lab simulation complete"
      ];
      consoleBox.textContent += `\n${extraLines.join("\n")}`;
    });
  }

  if (compareButton && consoleBox) {
    compareButton.addEventListener("click", () => {
      consoleBox.textContent += "\n[INFO] Comparing current run against prior baseline snapshot";
    });
  }
}

function renderIntegrity() {
  const data = state.data.integrity;

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
  const { overview, validationLab, integrity, reports } = state.data;
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

### Artifact Queue
${integrity.issues.map(issue => `- ${issue.artifact} | ${issue.severity} | ${issue.status}`).join("\n")}

## Reports
### Executive Summary
${reports.executiveSummary}

### Technical Summary
${reports.technicalSummary}

### Research Summary
${reports.researchSummary}

### Export Targets
${reports.exports.map(item => `- ${item}`).join("\n")}
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
  const data = state.data.reports;

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
          <h3>Export Targets</h3>
          <p>Structured outputs for the next documentation pass.</p>
        </div>
        <ul class="list">
          ${data.exports.map(item => `<li class="list-item">${item}</li>`).join("")}
        </ul>
      </article>

      <article class="card">
        <div class="section-heading">
          <h3>Distribution Plan</h3>
          <p>How these reports can support the next MVP phase.</p>
        </div>
        <ul class="list">
          <li class="list-item">Executive snapshot for stakeholders and partners.</li>
          <li class="list-item">Technical markdown for repo documentation.</li>
          <li class="list-item">Research notes for validation traceability.</li>
        </ul>
      </article>
    </div>

    <article class="card">
      <div class="section-heading">
        <h3>Report Actions</h3>
        <p>Placeholder export actions for the static cockpit MVP.</p>
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