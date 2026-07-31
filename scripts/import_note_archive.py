#!/usr/bin/env python3
"""Import the public Red Pen Journaling Note curriculum into the site CSV.

The script is intentionally rerunnable: it replaces only rows whose IDs start
with NOTE, keeps the Studio archive, and leaves the CSV as the CMS source of
truth. English bodies are machine-translated from the author's Japanese text
so the English blog never falls back to Japanese copy.
"""

import csv
import html
import re
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "site/content/blog-posts.csv"
NOTE = "https://note.com/kelly_note/n/"

# order, note id, permanent slug, Japanese editorial title, English title,
# category (EN/JA), and keywords (EN/JA)
ARTICLES = [
    (10, "n294f8f83edfb", "what-is-red-pen-journaling", "最初のステップ｜赤ペンジャーナリングとは", "First Step: What Is Red Pen Journaling?", "Getting started", "はじめる", "journaling, self-reflection, mental clarity", "ジャーナリング, 自己対話, 思考整理"),
    (20, "n22e7070b6de5", "red-pen-vs-regular-journaling", "最初のステップ｜ふつうのジャーナリングとの違い", "First Step: How It Differs from Regular Journaling", "Getting started", "はじめる", "journaling practice, reflection, self-awareness", "ジャーナリング, 振り返り, 自己認識"),
    (30, "n77e0028b773e", "why-review-your-thinking-now", "最初のステップ｜なぜ今、思考を整えるのか", "First Step: Why Review Your Thinking Now?", "Getting started", "はじめる", "mental clarity, information overload, reflection", "メンタルクラリティー, 情報過多, 振り返り"),
    (40, "n8943159a5457", "who-red-pen-journaling-is-for", "最初のステップ｜こんな人のための実践です", "First Step: Who This Practice Is For", "Getting started", "はじめる", "overthinking, self-reflection, journaling", "考えすぎ, 自己対話, ジャーナリング"),
    (50, "n3825bafc84f6", "write-review-move", "最初のステップ｜書く・見直す・行動する", "First Step: Write, Review, Move", "Getting started", "はじめる", "thinking process, action, reflection", "思考整理, 行動, 振り返り"),
    (60, "n2a38ea0cd48d", "what-you-need-to-start", "最初のステップ｜用意するもの", "First Step: What You Need to Begin", "Getting started", "はじめる", "notebook, pen, journaling tools", "ノート, ペン, 文房具"),
    (70, "nb6fb8684f655", "ground-rules-for-writing", "最初のステップ｜書く前に大切にしたいこと", "First Step: A Few Ground Rules Before You Write", "Getting started", "はじめる", "writing practice, self-compassion, reflection", "書く習慣, 自己受容, 振り返り"),
    (80, "nf08a4a5c6354", "practice-overview", "実践の準備｜書いて体感する7日間", "Practice Overview: Seven Days of Writing and Review", "Practice", "実践", "guided practice, journaling, self-review", "実践, ジャーナリング, 思考レビュー"),
    (90, "nf134052a2383", "practice-01-write-it-down", "実践 1｜まずは書いてみる", "Practice 1: Write What Is on Your Mind", "Practice", "実践", "brain dump, writing, reflection", "書き出し, ブレインダンプ, 振り返り"),
    (100, "nea659f3223d4", "practice-02-use-the-red-pen", "実践 2｜赤ペンを入れてみる", "Practice 2: Review with a Red Pen", "Practice", "実践", "red pen, review, metacognition", "赤ペン, 見直し, メタ認知"),
    (110, "n24610f925b20", "practice-03-go-deeper", "実践 3｜気になるところを深掘りする", "Practice 3: Go Deeper Where It Matters", "Practice", "実践", "deep reflection, emotions, journaling", "深掘り, 感情, ジャーナリング"),
    (120, "n94ac51fbbfc3", "practice-04-neutral-perspective", "実践 4｜ニュートラルな視点を持つ", "Practice 4: Take a Neutral Perspective", "Practice", "実践", "perspective, objectivity, reflection", "視点, 客観視, 振り返り"),
    (130, "n251303d498d1", "practice-05-turn-insight-into-action", "実践 5｜行動のタネを見つける", "Practice 5: Turn Insight into Action", "Practice", "実践", "next action, decision-making, reflection", "次の行動, 意思決定, 振り返り"),
    (140, "n79cc1bbbbcfb", "practice-06-ways-to-write", "実践 6｜いろいろな書き方を試す", "Practice 6: Try Different Ways of Writing", "Practice", "実践", "writing prompts, journaling, habits", "書き方, ジャーナリング, 習慣"),
    (150, "nb366236518aa", "practice-07-stationery", "実践 7｜書き続けるための文房具", "Practice 7: Stationery That Supports the Habit", "Practice", "実践", "stationery, notebook, writing habit", "文房具, ノート, 書く習慣"),
    (160, "nade8633310a5", "frameworks-and-techniques-overview", "整理の型｜フレームワークとテクニック", "Frameworks: An Overview of Tools and Techniques", "Frameworks", "整理の型", "frameworks, thinking tools, reflection", "フレームワーク, 思考ツール, 振り返り"),
    (170, "ncd41f6d18142", "frameworks-basics", "整理の型｜基本フレームワーク", "Frameworks: The Essential Models", "Frameworks", "整理の型", "frameworks, decision-making, clarity", "フレームワーク, 意思決定, 思考整理"),
    (180, "n82ce114cd615", "tool-brain-dump", "整理の型 1｜ブレインダンプ", "Tool 1: Brain Dump", "Frameworks", "整理の型", "brain dump, mental clutter, writing", "ブレインダンプ, 頭の整理, 書き出し"),
    (190, "nfce40e2b901d", "tool-deep-dive", "整理の型 2｜ディープダイブ", "Tool 2: Deep Dive", "Frameworks", "整理の型", "deep dive, reflection, questions", "ディープダイブ, 振り返り, 問い"),
    (200, "na010235ce86f", "tool-best-scenario", "整理の型 3｜ベストシナリオ", "Tool 3: Best Scenario", "Frameworks", "整理の型", "scenario planning, decision-making, reflection", "シナリオ, 意思決定, 振り返り"),
    (210, "n93a319f5b70a", "tool-do-or-dont", "整理の型 4｜やる・やらないを決める", "Tool 4: Decide What to Do — and What Not to Do", "Frameworks", "整理の型", "priorities, decisions, action", "優先順位, 意思決定, 行動"),
    (220, "ndd0db74cf2cc", "year-end-reflection", "季節のリフレクション｜今年のことを考える", "Seasonal Reflection: Review Your Year", "Reflection", "リフレクション", "year review, reflection, planning", "年末年始, 振り返り, 計画"),
]


def clean_text(node):
    text = node.get_text("\n", strip=True)
    return re.sub(r"\n{2,}", "\n\n", html.unescape(text)).strip()


def translate(text):
    """Translate conservatively in paragraph-sized requests to keep URLs small."""
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    translated = []
    for paragraph in paragraphs:
        chunks = [paragraph[i : i + 1400] for i in range(0, len(paragraph), 1400)]
        output = []
        for chunk in chunks:
            response = requests.get(
                "https://translate.googleapis.com/translate_a/single",
                params={"client": "gtx", "sl": "ja", "tl": "en", "dt": "t", "q": chunk},
                timeout=30,
            )
            response.raise_for_status()
            output.append("".join(part[0] for part in response.json()[0] if part[0]))
            time.sleep(0.08)
        translated.append("".join(output))
    return "\n\n".join(translated)


def excerpt(text, limit=150):
    return text.replace("\n", " ")[:limit].rstrip() + ("…" if len(text) > limit else "")


def main():
    with CSV_PATH.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        fields = reader.fieldnames
        studio_rows = [row for row in reader if not row["id"].startswith("NOTE")]

    for index, row in enumerate(studio_rows, start=1):
        row["order"] = str(300 + index * 10)

    note_rows = []
    for order, note_id, slug, title_ja, title_en, cat_en, cat_ja, keys_en, keys_ja in ARTICLES:
        source_url = NOTE + note_id
        response = requests.get(source_url, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        body = soup.select_one('[data-name="body"]')
        if body is None:
            raise RuntimeError(f"Could not read Note body: {source_url}")
        body_ja = clean_text(body)
        body_en = translate(body_ja)
        cover = soup.select_one('meta[property="og:image"]')
        date = soup.time.get("datetime", "")[:10] if soup.time else ""
        note_rows.append({
            "id": f"NOTE{order // 10:02d}", "order": str(order), "slug": slug, "date": date,
            "category_en": cat_en, "category_ja": cat_ja,
            "keywords_en": keys_en, "keywords_ja": keys_ja,
            "title_en": title_en, "title_ja": title_ja,
            "excerpt_en": excerpt(body_en), "excerpt_ja": excerpt(body_ja),
            "body_en": body_en, "body_ja": body_ja,
            "cover_image": html.unescape(cover.get("content", "")) if cover else "",
        })
        print(f"Imported {title_ja}")

    with CSV_PATH.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, quoting=csv.QUOTE_ALL, lineterminator="\n")
        writer.writeheader()
        writer.writerows(note_rows + studio_rows)


if __name__ == "__main__":
    main()
