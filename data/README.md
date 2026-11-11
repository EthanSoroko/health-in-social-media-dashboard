# Dashboard data

The dashboard reads everything from this folder when the page loads. Adding a community
(subreddit) only takes data files: no code changes.

```
data/
  subreddits.json                  list of communities shown in the dropdown
  subreddits/
    kallmann_syndrome/
      posts.json                   required
      predictions.json             optional (the "Actual vs. Predicted" chart)
      test_predictions.csv         source for predictions.json (not read by the page)
    klinefelter_syndrome/          add the same files here
```

The page loads its data with `fetch`, so serve it (`python3 -m http.server`) instead of opening
`index.html` directly.

## Adding a community, for example r/klinefelter_syndrome

1. Create the folder `data/subreddits/klinefelter_syndrome/`. The folder name must match `name` in step 3 exactly
   (case matters).
2. Add `posts.json` to it, and `predictions.json` if you have model predictions (formats below).
3. In `data/subreddits.json`, set `"ready": true` on its entry (or add an entry if it isn't listed):

   ```json
   {"name": "klinefelter_syndrome", "display_name": "r/klinefelter_syndrome", "ready": true, "predictions": false}
   ```

   | Field          | Meaning                                                                   |
   |----------------|---------------------------------------------------------------------------|
   | `name`         | Folder name under `data/subreddits/`                                      |
   | `display_name` | Shown in the dropdown, subtitles and the Compare Communities table        |
   | `ready`        | `false` lists it as "(coming soon)" and disabled; `true` loads its files |
   | `predictions`  | `true` if the folder has `predictions.json`; leave it out or `false` otherwise |

   The first ready community in the list is the one shown when the page opens.
4. Reload the page. The new community appears in the dropdown, and Compare Communities shows
   it side by side with the others. If a file is missing or broken, a red message under the
   page title says which one.

## posts.json

```json
{
  "range": {"start": "2016-02-01", "end": "2026-09-30"},
  "who_order": ["Patient", "Researcher", "Advocate", "Family Member", "Doctor", "Unknown"],
  "what_order": ["Sharing Info", "Seeking Info", "Asking for Opinions", "Research"],
  "posts": [
    {"date": "2016-02-07", "who": "Patient", "what": ["Sharing Info"], "title": "An apology", "snippet": "Sorry to everyone...", "score": 2, "comments": 0, "url": "https://www.reddit.com/r/kallmann_syndrome/comments/44k46b/an_apology/"}
  ]
}
```

| Field        | Required | Meaning                                                                                              |
|--------------|----------|------------------------------------------------------------------------------------------------------|
| `range`      | no       | Period the data covers, `YYYY-MM-DD`. Defaults to the first and last post dates.                     |
| `who_order`  | no       | Poster types in legend and color order. Defaults to the order they first appear in `posts`.          |
| `what_order` | no       | Post types in legend and color order. Defaults to the order they first appear in `posts`.            |
| `posts`      | yes      | One object per post, in any order (the page sorts them by date).                                     |

Each post:

| Field      | Required | Meaning                                                                                     |
|------------|----------|---------------------------------------------------------------------------------------------|
| `date`     | yes      | `YYYY-MM-DD`                                                                                |
| `who`      | yes      | Poster type. Use `"Patient"` for patients: the "Patient posters" stat counts that exact value. Use `"Unknown"` when unclear (always shown in gray). |
| `what`     | yes      | List of post types, usually one, for example `["Seeking Info"]`                            |
| `title`    | yes      | Post title (may be `""`)                                                                    |
| `snippet`  | no       | Short excerpt shown under the title                                                         |
| `score`    | no       | Reddit score (number)                                                                       |
| `comments` | no       | Reddit comment count (number). If any post lacks it, the second stat card shows "Test posts" instead of "Comments". |
| `url`      | no       | Reddit link. Only `https://www.reddit.com/...` links are made clickable.                    |

## predictions.json (optional)

Set `"predictions": true` on the community in `data/subreddits.json` when you add this file.
Without it, the "Actual vs. Predicted" section says there are no predictions for that community.

```json
{
  "models": [{"id": "logistic_regression", "name": "Logistic Regression"}, {"id": "linear_svm", "name": "Linear SVM"}],
  "categories": ["Sharing Info", "Seeking Info", "Asking for Opinions", "Research"],
  "posts": [
    ["2016-02-07", "Sharing Info", "Sharing Info", "Sharing Info"]
  ]
}
```

| Field        | Meaning                                                                                              |
|--------------|------------------------------------------------------------------------------------------------------|
| `models`     | Models in the dropdown. `name` is what's shown.                                                      |
| `categories` | Bars on the chart, in order                                                                          |
| `posts`      | One array per test post: `[date, actual category, prediction of model 1, prediction of model 2, ...]`, with predictions in `models` order |

## Building the files with the scripts

For r/kallmann_syndrome both files were generated from the health-social-media-viz project's
`index.html`. If the new community's data comes from the same kind of page, the scripts can
build them. The last argument is the folder name:

```bash
python3 scripts/build_posts_data.py /path/to/viz/index.html klinefelter_syndrome
# needs data/subreddits/klinefelter_syndrome/test_predictions.csv (columns: text, actual_label, pred_<model>...)
python3 scripts/build_predictions_data.py /path/to/viz/index.html klinefelter_syndrome
```

Otherwise, write the JSON files in the formats above any way you like.
