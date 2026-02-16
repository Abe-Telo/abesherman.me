# abesherman.me profile content pack

This repository stores canonical profile content for use in a site generator.

## Single source of truth
- Primary profile data: `data/profile.json`
- Resume-style timeline: `data/timeline.yaml`
- SEO person schema: `seo/person.schema.jsonld`

## Content sections
- About page: `content/about.md`
- Header/social bios: `content/bios.md`
- Projects section: `content/projects.md`

Use `data/profile.json` as the canonical source and render Home hero, About, Projects, and SEO from it where possible.
