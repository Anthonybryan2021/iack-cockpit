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

## Boundaries
- The IACK framework owns metric generation, validation logic, report writing, and the production of source JSON artifacts.
- The IACK Cockpit owns static rendering, dashboard presentation, and read-only consumption of published JSON artifacts.
- The cockpit does not calculate authoritative metrics; it displays artifacts produced by the framework.
- PowerShell sync scripts and future GitHub Actions automation are transport layers between framework outputs and cockpit inputs, not alternate sources of truth.

## Invariants
- `outputs/metrics-output.json` is the framework-produced source artifact for current metric export.
- `assets/data/current-metrics.json` is the cockpit-ready synchronized copy used by the UI.
- `assets/data/validation-history.json` is the append-only validation evidence record for cockpit history views.
- `assets/data/formula-changelog.json` is the traceability record for metric formula changes.
- Cockpit views must map to versioned JSON artifacts, not handwritten dashboard values.
- Any change to artifact structure must be reflected in both the framework export path and cockpit documentation before release.
- GitHub Pages publishes only the static cockpit surface; it is not the metric computation environment.
