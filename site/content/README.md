# Blog content management

`blog-posts.csv` is the single source of truth for articles on both the Japanese and English blog pages.

## Reordering articles

Change the `order` number and save the file. Smaller numbers appear first. Use whole numbers (for example `10`, `20`, `30`) so that a new article can be inserted between existing ones without renumbering the entire archive.

## Required fields

- `id`: permanent internal identifier (for example `RPJ004`)
- `order`: display sequence
- `slug`: URL identifier; do not change after publishing
- `title_ja` / `body_ja`: Japanese title and article content
- `title_en` / `body_en`: English title and article content

## Optional editorial fields

- `cover_image`: a narrow image band shown on article cards; leave empty for the neutral graphic treatment
- `category_ja`, `keywords_ja`, `excerpt_ja`: listing metadata
- `excerpt_en`, `category_en`, and `keywords_en`: English listing metadata

Keep commas, quotes, and line breaks inside the existing quotation marks. The site supports multi-line article bodies.
