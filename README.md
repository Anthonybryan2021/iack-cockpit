# IACK Cockpit

IACK Cockpit is a static MVP dashboard for the IACK framework. It gives a validation-first view of framework posture across four screens: Overview, Validation Lab, Integrity, and Reports.

## What it does

- Shows a cockpit-style summary of IACK metrics.
- Simulates validation workflows in the Validation Lab.
- Surfaces integrity status, drift, and exceptions.
- Generates a Markdown report export from the Reports screen.
- Supports light and dark theme switching.

## Screens

### Overview
A high-level posture view with scorecards, pillar scores, and recent changes.

### Validation Lab
A workspace for validation runs, test summaries, run metadata, and execution logs.

### Integrity
A focused view for integrity score, drift events, artifact review, and exceptions.

### Reports
A reporting area for executive, technical, and research-facing summaries with export actions.

## Live demo

If GitHub Pages is enabled, the app is published as a static site from the repository root.

## Local run

This project is a static HTML app. To preview it locally:

```powershell
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Repository structure

```text
iack-cockpit/
├── index.html
├── CNAME
├── .nojekyll
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── data/
│       └── mock-data.json
└── README.md
```

## Release status

Current milestone: `v0.2.0-prep`

This release is an MVP checkpoint for validation, testing, documentation, and GitHub Pages deployment.

## Planned next steps

- Connect the Validation Lab to real framework outputs.
- Add CI checks for validation and linting.
- Expand report generation and export options.
- Refine metrics visualization and traceability notes.

## License

No license has been selected yet.
