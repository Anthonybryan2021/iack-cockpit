# IACK Cockpit Architecture

## Purpose
The IACK Cockpit provides a validation-first dashboard for the IACK framework.

## Current Architecture
Python metrics scripts generate JSON artifacts.
PowerShell scripts sync those artifacts into the cockpit data directory.
The static cockpit reads JSON files and renders the interface in-browser.
GitHub Pages publishes the application as a static site.

## Data Flow
1. Python generates `outputs/metrics-output.json`.
2. PowerShell syncs the latest output into `assets/data/current-metrics.json`.
3. Validation run snapshots are stored in `assets/data/validation-history.json`.
4. Formula updates are stored in `assets/data/formula-changelog.json`.
5. The cockpit loads all three files and renders operational views.

## Current UI Scope
- Overview
- Validation Lab
- Integrity
- Reports

## Planned Evolution
- GitHub Actions validation pipeline
- Real-time metric export automation
- Trend visualizations
- Stronger evidence traceability
- Research-oriented reporting outputs
