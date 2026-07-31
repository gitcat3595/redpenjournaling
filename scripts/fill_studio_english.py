#!/usr/bin/env python3
"""Fill English fields for Japanese-only Studio archive rows."""

import csv
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import requests

CSV_PATH = Path(__file__).resolve().parents[1] / "site/content/blog-posts.csv"


def translate(text):
    if not text:
        return ""
    chunks = [text[i : i + 1800] for i in range(0, len(text), 1800)]
    output = []
    for chunk in chunks:
        response = requests.get(
            "https://translate.googleapis.com/translate_a/single",
            params={"client": "gtx", "sl": "ja", "tl": "en", "dt": "t", "q": chunk},
            timeout=20,
        )
        response.raise_for_status()
        output.append("".join(part[0] for part in response.json()[0] if part[0]))
    return "".join(output)


def translate_row(index, row):
    if row["id"].startswith("NOTE") or row["body_en"]:
        return index, row
    row["title_en"] = translate(row["title_ja"])
    row["body_en"] = translate(row["body_ja"])
    row["excerpt_en"] = row["body_en"].replace("\n", " ")[:150].rstrip() + "…"
    row["category_en"] = translate(row["category_ja"])
    row["keywords_en"] = translate(row["keywords_ja"])
    return index, row


def main():
    with CSV_PATH.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        fields, rows = reader.fieldnames, list(reader)
    with ThreadPoolExecutor(max_workers=5) as pool:
        futures = [pool.submit(translate_row, index, row) for index, row in enumerate(rows)]
        for future in as_completed(futures):
            index, row = future.result()
            rows[index] = row
            if row["id"].startswith("RPJ") and row["body_en"]:
                print(f"English ready: {row['id']}")
    with CSV_PATH.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, quoting=csv.QUOTE_ALL, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


if __name__ == "__main__":
    main()
