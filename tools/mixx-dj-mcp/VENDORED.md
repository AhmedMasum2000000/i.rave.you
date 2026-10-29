# Mixx-DJ-MCP (vendored)

A copy of [sandraschi/mixx-dj-mcp](https://github.com/sandraschi/mixx-dj-mcp) at commit
`43151997f5dc3502e38f44a08e0116dee07b4ac1`, MIT-licensed (see `LICENSE`, © 2026 Sandra Schipal).
Kept here so the I Rave You team can mix from Claude Code. It is not part of the website build:
Vite only builds `src/`, `public/` and the pages listed in `vite.config.ts`.

Left out of the copy: build leftovers (`*.egg-info`, `web_sota/dist`, `*.tsbuildinfo`, a `justfile` backup).

## What it does

An MCP server that lets Claude control the **Mixxx** DJ app on your own computer through OSC:
decks, library, effects, mixer, transitions, recording, BPM/key analysis and set planning.
It needs Mixxx running on the same machine, so it runs on your laptop, not on the Hostinger site
or in a Claude cloud session.

## Run it on your computer

1. Install [Mixxx 2.5](https://mixxx.org), Python 3.12 and [uv](https://docs.astral.sh/uv/).
2. In Mixxx: **Preferences → MIDI/OSC → Enable OSC**, out port `11118`, in port `11119`, send to `127.0.0.1`, restart Mixxx.
3. In this folder:

   ```bash
   uv sync
   uv run uvicorn mixx_dj_mcp.server:app --port 11116
   ```

4. Connect Claude Code to it (once):

   ```bash
   claude mcp add --transport http mixx-dj http://127.0.0.1:11116/mcp
   ```

   Or run it over stdio instead: `claude mcp add mixx-dj -- uv --directory <path-to>/tools/mixx-dj-mcp run mixx-dj-mcp`.

5. Ask for things like “load the next track on deck 2, sync it and fade in on the next phrase”,
   or “record this set”. A recorded set can then go on Qbic Pulse Radio with
   `node scripts/add-set.mjs <recording> --slug qbic-pulse-vol-2 --volume "Vol. 2" --date YYYY-MM-DD --tracklist tracklist.txt`.

Notes: the heavy optional features (Demucs stems, transformers) download large models on first use.
Several helper scripts (`start.ps1`, `native/`) target Windows; the Python server itself is cross-platform.

## Updating the copy

```bash
git clone --depth 1 https://github.com/sandraschi/mixx-dj-mcp.git /tmp/mixx
rm -rf tools/mixx-dj-mcp && mkdir -p tools/mixx-dj-mcp
git -C /tmp/mixx archive HEAD | tar -x -C tools/mixx-dj-mcp
```

Keep this file and update the commit above.
