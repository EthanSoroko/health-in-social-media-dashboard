"""Build data/subreddits/<subreddit>/posts.json from a health-social-media-viz index.html.

That page embeds every post of a subreddit (date, poster type, post type, title, snippet,
score, comment count, Reddit link) in a `const DATA = {...};` line. This copies the posts, plus
the category orders and the covered date range, into the JSON file the dashboard loads.
See data/README.md for the file format.

Usage:
    python3 scripts/build_posts_data.py /path/to/health-social-media-viz/index.html [subreddit]

subreddit is the folder name under data/subreddits/ (default: kallmann_syndrome).
"""

import calendar
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SUBREDDITS_DIR = ROOT / "data" / "subreddits"


def write_json(path, header, list_key, items):
    """Write a JSON object with one list item per line, so diffs stay readable."""
    lines = ["{"]
    lines += [f"  {json.dumps(key)}: {json.dumps(value, ensure_ascii=False)}," for key, value in header.items()]
    lines.append(f"  {json.dumps(list_key)}: [")
    lines.append(",\n".join("    " + json.dumps(item, ensure_ascii=False) for item in items))
    lines += ["  ]", "}"]
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def load_viz_data(viz_html):
    for line in Path(viz_html).read_text(encoding="utf-8").splitlines():
        if line.startswith("const DATA = "):
            return json.loads(line[len("const DATA = "):].rstrip(";"))
    sys.exit(f"Could not find 'const DATA = ...' in {viz_html}")


def main():
    if len(sys.argv) not in (2, 3):
        sys.exit(__doc__)
    viz = load_viz_data(sys.argv[1])
    out_path = SUBREDDITS_DIR / (sys.argv[2] if len(sys.argv) == 3 else "kallmann_syndrome") / "posts.json"

    posts = sorted(
        (
            {
                "date": p["date"],
                "who": p["who"],
                "what": p["what"],
                "title": p["title"],
                "snippet": p["snippet"],
                "score": p["score"],
                "comments": p["num_comments"],
                "url": p["permalink"],
            }
            for p in viz["posts"]
        ),
        key=lambda p: p["date"],
    )

    # The covered period runs from the first day of the first month to the last day of the last month.
    first_month, last_month = viz["months"][0]["month"], viz["months"][-1]["month"]
    year, month = map(int, last_month.split("-"))
    start = f"{first_month}-01"
    end = f"{last_month}-{calendar.monthrange(year, month)[1]:02d}"
    assert all(start <= p["date"] <= end for p in posts), "post dates fall outside the monthly range"
    assert len(posts) == sum(m["count"] for m in viz["months"]), "post count does not match monthly totals"

    write_json(
        out_path,
        {"range": {"start": start, "end": end}, "who_order": viz["whoOrder"], "what_order": viz["whatOrder"]},
        "posts",
        posts,
    )
    print(f"Wrote {len(posts)} posts ({start} to {end}) to {out_path.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
