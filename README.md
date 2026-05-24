# IACK Cockpit

IACK Cockpit is a validation-first static dashboard for the IACK framework. It provides an operational view of framework posture, validation runs, integrity findings, and report outputs.

## Purpose
The cockpit exists to make IACK metrics easier to inspect, validate, and communicate. It acts as an MVP control surface for connecting metric outputs, validation evidence, and documentation into a single interface.

## Current MVP Scope
- Overview
- Validation Lab
- Integrity
- Reports

## Data Workflow
1. Python produces metric output JSON.
2. PowerShell syncs the latest JSON artifact into the cockpit.
3. The cockpit loads current metrics, validation history, and formula changelog files.
4. GitHub Pages serves the static application.

## Repository Structure
```text
iack-cockpit/
├── index.html
├── README.md
├── docs/
│   └── architecture.md
├── outputs/
│   └── metrics-output.json
├── scripts/
├── assets/
│   ├── css/
│   ├── js/
│   │   └── app.js
│   └── data/
│       ├── current-metrics.json
│       ├── validation-history.json
│       └── formula-changelog.json
```

## Local Run
```powershell
python -m http.server 8080
```

Then open:
```text
http://localhost:8080
```

## Documentation
- Architecture: `docs/architecture.md`

## Next Milestones
- Connect to real Python metric outputs
- Add richer validation history trends
- Improve metric formula traceability
- Expand documentation and CI integration

## Status
Current milestone: `v0.2.0-prep`
