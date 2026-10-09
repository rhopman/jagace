# Repository Instructions

This repository is published with GitHub Pages from the `main` branch.

When a user requests a change to the game or site, complete the full delivery loop in the same turn:

1. Make the requested change.
2. Run the relevant checks, including `npm test` and `npm run build` for code, gameplay, UI, or workflow changes.
3. Commit the completed change.
4. Push the commit to `main`.

Pushing to `main` automatically starts the GitHub Actions workflow that builds and deploys the site to GitHub Pages. Do not wait for a separate "publish" or "deploy" request after making a change unless the user explicitly asks you not to push.

For documentation-only edits, still commit and push the change. Run the full checks when the edit affects commands, deployment, gameplay instructions, or anything that could change how the site builds or runs.
