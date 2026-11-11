"""Build data/subreddits/<subreddit>/predictions.json from that folder's test_predictions.csv.

The CSV has each test post's text, its actual label, and one `pred_<model>` column per model,
but no dates. Dates come from the posts embedded in the health-social-media-viz project's
index.html: each CSV row is matched to the post whose title starts the text (and, if several
titles match, whose opening snippet also appears in it).

See data/README.md for the file format.

Usage:
    python3 scripts/build_predictions_data.py /path/to/health-social-media-viz/index.html [subreddit]

subreddit is the folder name under data/subreddits/ (default: kallmann_syndrome).
"""

import csv
import json
import re
import sys
from pathlib import Path

from build_posts_data import write_json

ROOT = Path(__file__).resolve().parent.parent
SUBREDDITS_DIR = ROOT / "data" / "subreddits"

# Nicer names for the dropdown; any other model falls back to a title-cased column name.
MODEL_NAMES = {"logistic_regression": "Logistic Regression", "linear_svm": "Linear SVM"}


def normalize(text):
    return re.sub(r"\s+", " ", text).strip().lower()


def load_viz_data(viz_html):
    for line in Path(viz_html).read_text(encoding="utf-8").splitlines():
        if line.startswith("const DATA = "):
            return json.loads(line[len("const DATA = "):].rstrip(";"))
    sys.exit(f"Could not find 'const DATA = ...' in {viz_html}")


def find_post(text, posts):
    text = normalize(text)
    candidates = [p for p in posts if p["title"] and text.startswith(normalize(p["title"]))]
    if len(candidates) > 1:
        candidates = [p for p in candidates if normalize(p["snippet"])[:40] in text] or candidates
    return candidates[0] if len(candidates) == 1 else None


def main():
    if len(sys.argv) not in (2, 3):
        sys.exit(__doc__)
    viz = load_viz_data(sys.argv[1])
    folder = SUBREDDITS_DIR / (sys.argv[2] if len(sys.argv) == 3 else "kallmann_syndrome")
    csv_path = folder / "test_predictions.csv"
    out_path = folder / "predictions.json"

    with csv_path.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    model_columns = [c for c in rows[0] if c.startswith("pred_")]
    model_ids = [c[len("pred_"):] for c in model_columns]

    records, unmatched = [], []
    for row in rows:
        post = find_post(row["text"], viz["posts"])
        if post is None:
            unmatched.append(row["text"][:80])
            continue
        records.append([post["date"], row["actual_label"], *(row[c] for c in model_columns)])
    records.sort(key=lambda r: r[0])

    labels = {r[i] for r in records for i in range(1, len(r))}
    categories = [c for c in viz["whatOrder"] if c in labels] + sorted(labels - set(viz["whatOrder"]))
    models = [{"id": m, "name": MODEL_NAMES.get(m, m.replace("_", " ").title())} for m in model_ids]

    # Each post: [date, actual, ...one prediction per model, in "models" order]
    write_json(out_path, {"models": models, "categories": categories}, "posts", records)

    print(f"Wrote {len(records)} posts to {out_path.relative_to(ROOT)} ({records[0][0]} to {records[-1][0]}), "
          f"models: {', '.join(m['name'] for m in models)}")
    if unmatched:
        print(f"WARNING: {len(unmatched)} rows had no matching dated post and were skipped:")
        for text in unmatched:
            print("  ", text)


if __name__ == "__main__":
    main()
