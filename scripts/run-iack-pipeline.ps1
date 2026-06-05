param(
    [string]$PythonScript = ".\scripts\generate-metrics.py",
    [string]$AssessmentInputFile = ".\assets\data\assessment-input.json",
    [string]$CurrentMetricsFile = ".\assets\data\current-metrics.json",
    [string]$HistoryFile = ".\assets\data\validation-history.json",
    [string]$ChangeFile = ".\assets\data\formula-changelog.json",
    [string]$SummaryFile = ".\outputs\assessment-summary.json",
    [switch]$AppendFormulaChange,
    [string]$ChangeSummary = "",
    [string]$Reason = "",
    [switch]$Commit,
    [switch]$Push,
    [string]$CommitMessage = "Update IACK metrics"
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Resolve-RepoPath {
    param([string]$RelativePath)
    $root = Split-Path -Parent $PSScriptRoot
    return [System.IO.Path]::GetFullPath((Join-Path $root $RelativePath))
}

function Ensure-ParentDirectory {
    param([string]$Path)
    $parent = Split-Path -Parent $Path
    if (-not (Test-Path $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }
}

function Save-Json {
    param(
        [Parameter(Mandatory = $true)]$Data,
        [Parameter(Mandatory = $true)][string]$Path
    )
    Ensure-ParentDirectory -Path $Path
    [System.IO.File]::WriteAllText(
        $Path,
        (ConvertTo-Json -InputObject $Data -Depth 20),
        (New-Object System.Text.UTF8Encoding($false))
    )
}

function Test-JsonFile {
    param([string]$Path)
    try {
        Get-Content $Path -Raw | ConvertFrom-Json -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

function Load-JsonArray {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        return (New-Object System.Collections.ArrayList)
    }

    $raw = Get-Content $Path -Raw
    if ([string]::IsNullOrWhiteSpace($raw)) {
        return (New-Object System.Collections.ArrayList)
    }

    $parsed = $raw | ConvertFrom-Json -ErrorAction Stop
    $list = New-Object System.Collections.ArrayList

    if ($parsed -is [System.Collections.IEnumerable] -and -not ($parsed -is [string])) {
        foreach ($item in @(@($parsed))) {
            [void]$list.Add($item)
        }
    }
    else {
        [void]$list.Add($parsed)
    }

    return $list
}

$pythonPath  = Resolve-RepoPath $PythonScript
$inputPath   = Resolve-RepoPath $AssessmentInputFile
$currentPath = Resolve-RepoPath $CurrentMetricsFile
$historyPath = Resolve-RepoPath $HistoryFile
$changePath  = Resolve-RepoPath $ChangeFile
$summaryPath = Resolve-RepoPath $SummaryFile

if (-not (Test-Path $pythonPath)) {
    throw "Python script not found: $pythonPath"
}

Write-Step "Running Python metrics generator"
python $pythonPath --input $inputPath --current $currentPath --summary $summaryPath
if ($LASTEXITCODE -ne 0) {
    throw "Python metrics generation failed."
}

Write-Step "Validating generated JSON"
if (-not (Test-Path $currentPath)) {
    throw "Current metrics file not found: $currentPath"
}
if (-not (Test-Path $summaryPath)) {
    throw "Summary file not found: $summaryPath"
}
if (-not (Test-JsonFile $currentPath)) {
    throw "Invalid JSON in current metrics file: $currentPath"
}
if (-not (Test-JsonFile $summaryPath)) {
    throw "Invalid JSON in summary file: $summaryPath"
}

$current = Get-Content $currentPath -Raw | ConvertFrom-Json
$summary = Get-Content $summaryPath -Raw | ConvertFrom-Json

Write-Step "Appending validation history"
$history = Load-JsonArray $historyPath

$historyEntry = [pscustomobject]@{
    runId         = [guid]::NewGuid().ToString()
    assessmentId  = $current.assessmentId
    timestamp     = $current.timestamp
    status        = $current.validationStatus
    confidence    = $current.confidence
    overallScore  = $current.overallScore
    openFindings  = $current.openFindings
    source        = "run-iack-pipeline.ps1"
    summarySource = (Split-Path -Leaf $summaryPath)
}

if ($history -isnot [System.Collections.ArrayList]) { $tmp = New-Object System.Collections.ArrayList; foreach ($item in @($history)) { [void]$tmp.Add($item) }; $history = $tmp }; [void]$history.Add($historyEntry)
Save-Json -Data @($history) -Path $historyPath

if ($AppendFormulaChange) {
    Write-Step "Appending formula changelog"
    $changes = Load-JsonArray $changePath

    $changeEntry = [pscustomobject]@{
        changeId     = [guid]::NewGuid().ToString()
        timestamp    = $current.timestamp
        assessmentId = $current.assessmentId
        summary      = $ChangeSummary
        reason       = $Reason
        source       = "run-iack-pipeline.ps1"
    }

    if ($changes -isnot [System.Collections.ArrayList]) { $tmp = New-Object System.Collections.ArrayList; foreach ($item in @($changes)) { [void]$tmp.Add($item) }; $changes = $tmp }; [void]$changes.Add($changeEntry)
    Save-Json -Data @($changes) -Path $changePath
}

if ($Commit) {
    Write-Step "Staging files for git"
    git add $PythonScript $AssessmentInputFile $CurrentMetricsFile $HistoryFile $SummaryFile
    if ($AppendFormulaChange) {
        git add $ChangeFile
    }

    Write-Step "Creating git commit"
    git commit -m $CommitMessage
    if ($LASTEXITCODE -ne 0) {
        throw "Git commit failed."
    }

    if ($Push) {
        Write-Step "Pushing to origin/main"
        git push origin main
        if ($LASTEXITCODE -ne 0) {
            throw "Git push failed."
        }
    }
}

Write-Step "Pipeline completed successfully"

