# Blog Directory

Place your markdown (.md) files in this directory.

## To add a new blog post:

1. Create a `.md` file in this directory (e.g., `2025-01-15-my-post.md`)
2. Add an entry to `posts.json` with:
   - `filename`: the name of your .md file
   - `title`: the display title
   - `date`: the publication date

Example entry in `posts.json`:
```json
{
    "filename": "2025-01-15-my-post.md",
    "title": "My First Post",
    "date": "January 15, 2025"
}
```

Posts are displayed in the order they appear in `posts.json` (newest first if you add them at the top).

