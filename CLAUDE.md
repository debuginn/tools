# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A Hugo-based static website at https://tools.debuginn.com/ hosting client-side creative tools (poster/cover generators). All tool logic runs entirely in the browser — no backend, no build pipeline beyond Hugo.

## Commands

```bash
# Serve locally with live reload
hugo server

# Build static site to public/
hugo

# Initialize theme submodule (required after fresh clone)
git submodule update --init --recursive
```

## Architecture

### Hugo Site
- **Theme:** `hugo-theme-skills` (git submodule at `themes/hugo-theme-skills/`)
- **Languages:** English (default, `content/`) and Chinese (`content/zh/`)
- **Config:** `hugo.toml` — site params, bilingual setup, social links

### Tool Pages
Each tool is a content Markdown file with frontmatter that drives how the theme renders it:

```toml
toolType = "..."        # tool identifier
toolCSS = "/css/..."    # loaded by theme for this tool
toolJS  = "/js/..."     # loaded by theme for this tool
installCode = "..."     # shown in install block on the page
```

The theme reads these params and injects the CSS/JS files. Tool logic is self-contained vanilla JS IIFEs in `static/js/`.

### Tools

| Tool | JS | CSS | Canvas Size |
|---|---|---|---|
| WeChat/XHS Poster | `static/js/wx-xhs-poster.js` | `static/css/wx-xhs-poster.css` | 1080×1080 or 1080×1440 |
| Blog Cover | `static/js/blog-cover.js` | `static/css/blog-cover.css` | 1600×900 |

Both tools:
- Use HTML5 Canvas for rendering and PNG export (2× scale)
- Persist form state to `localStorage` (key: `debuginn_{toolType}_state`)
- Have no external JS dependencies

### Adding a New Tool
1. Add `static/js/{tool}.js` and `static/css/{tool}.css`
2. Create `content/tools/{tool}.md` and `content/zh/tools/{tool}.md` with matching frontmatter
3. The theme handles rendering — no Hugo template changes needed
