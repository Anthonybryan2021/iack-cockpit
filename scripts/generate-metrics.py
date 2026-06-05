import argparse
import json
from pathlib import Path
from datetime import datetime, timezone

def clamp(value, low=0, high=100):
    return max(low, min(high, value))

parser = argparse.ArgumentParser()
parser.add_argument("--input", required=True)
parser.add_argument("--current", required=True)
parser.add_argument("--summary", required=True)
args = parser.parse_args()

input_path = Path(args.input)
current_path = Path(args.current)
summary_path = Path(args.summary)

if not input_path.exists():
    sample = {
        "assessmentId": "iack-local-001",
        "integrity": 78,
        "authenticity": 84,
        "confidentiality": 81,
        "validationStatus": "Passed",
        "confidence": 0.91,
        "openFindings": 5,
        "changeSummary": [
            "Integrity score dropped 3 points after artifact drift detection.",
            "Validation coverage improved after metric test alignment.",
            "Report export template updated for research review."
        ]
    }
    input_path.parent.mkdir(parents=True, exist_ok=True)
    input_path.write_text(json.dumps(sample, indent=2), encoding="utf-8")

data = json.loads(input_path.read_text(encoding="utf-8"))

integrity = clamp(int(data.get("integrity", 0)))
authenticity = clamp(int(data.get("authenticity", 0)))
confidentiality = clamp(int(data.get("confidentiality", 0)))
overall = round((integrity + authenticity + confidentiality) / 3)

current = {
    "assessmentId": data.get("assessmentId", "unknown"),
    "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    "overallScore": overall,
    "validationStatus": data.get("validationStatus", "Unknown"),
    "confidence": data.get("confidence", 0.0),
    "openFindings": data.get("openFindings", 0),
    "pillars": {
        "integrity": integrity,
        "authenticity": authenticity,
        "confidentiality": confidentiality
    },
    "changeSummary": data.get("changeSummary", [])
}

summary = {
    "assessmentId": current["assessmentId"],
    "generatedAt": current["timestamp"],
    "status": current["validationStatus"],
    "overallScore": current["overallScore"],
    "confidence": current["confidence"],
    "openFindings": current["openFindings"],
    "source": "generate-metrics.py"
}

current_path.parent.mkdir(parents=True, exist_ok=True)
summary_path.parent.mkdir(parents=True, exist_ok=True)

current_path.write_text(json.dumps(current, indent=2), encoding="utf-8")
summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")

print(f"Wrote {current_path}")
print(f"Wrote {summary_path}")

