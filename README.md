# CodeTrooper — Simulation lab

A small, static simulation playground with three original experiments:

1. **Ring escape** — a bouncing ball escapes concentric rotating rings through their gaps.
2. **Growing ball** — its radius increases on every wall bounce, until it fills most of the enclosure.
3. **Marble race** — six equal marbles race through a pegboard. Pick a color and watch the finishing order.

Simple slate and ice-blue interface; navy canvas; real Motion animations for page entry, experiment changes and hover feedback. No generated art, accounts, API keys, analytics, paid services, installation or build command. All runtime files, including Motion, are bundled locally. This is AI-assisted source code, not a claim of human-only authorship.

## Publish on GitHub Pages

1. Extract the ZIP on your computer.
2. Create a public GitHub repository, for example `codetrooper-lab`.
3. Upload **the extracted files and the vendor folder**, not the ZIP itself. `index.html` must be at the repository root, not inside another folder.
4. Open **Settings → Pages**. Under Build and deployment, select **Deploy from a branch**.
5. Select **main** and **/ (root)**, then Save.
6. Wait for GitHub to publish. Your address will normally be `https://YOUR-USERNAME.github.io/codetrooper-lab/`.

No domain configuration is necessary. Relative asset paths support repository subpaths. The included `.nojekyll` file bypasses Jekyll processing; if your uploader hides it, the standard assets still work.

[Official GitHub Pages instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)

## Use it locally

Double-click `index.html` to use the simulations. For video recording, a current desktop Chrome, Brave or Edge on the published HTTPS site is recommended. To preview through a local server if Python is already installed, run `python -m http.server 8000` in the extracted folder, then open `http://localhost:8000`.

## Make a video

- Pick an experiment and adjust its settings. Changing physics settings restarts the run.
- A seed repeats the starting conditions for the same experiment, frame size and settings. **New seed** changes the run. Default seed 42 is a useful starting point.
- Add your own on-screen title, select the ball color and toggle trails or branding.
- **9:16** records a 1080 × 1920 canvas; **1:1** records 1080 × 1080. Switching frame shape changes the arena geometry and therefore the outcome.
- **Record from start** resets and plays the run. It stops at the selected time limit, or 1.5 seconds after a completed result, whichever comes first. Click Stop to finish sooner.
- Keep the tab visible. Hiding it stops the recording to avoid long blank or throttled sections. Settings are locked during capture.
- Click **Download clip** after recording. Desktop Chromium normally produces **WebM**. MP4 is used only when it is the supported fallback. Import WebM into an editor and export MP4 if your workflow requires it. This is not a guaranteed MP4 encoder.
- Capture is silent, with a 60 fps target and 8 Mbps requested bitrate. Actual smoothness depends on the device and browser; it is a real-time capture, not offline frame rendering. No microphone or screen-sharing permission is needed.
- **Save image** saves the current frame as a full-resolution PNG. **Fullscreen** shows only the canvas.
- Space pauses/plays; R restarts when focus is not in a control. Reduced-motion preferences disable interface animations and start the simulation paused.

Runs can end differently; ring escape is not forced to succeed. A 90-second simulation-time limit prevents indefinite runs. Higher playback speed shortens the real-world duration. Marble races usually finish quickly; try slow motion for longer clips.

## What is simulated?

Fixed steps of 1/240 second, seeded initial conditions, gravity, circular wall reflections, peg collisions and equal-mass marble collisions. Rings disappear after the ball clears them. Growing balls intentionally gain size; velocity caps, damping and small seeded anti-stall nudges keep the toy simulations manageable. These are entertainment simulations, not quantitatively accurate physical models. There are no invisible winner-selection rules or copied video assets.

## Files and customization

- `index.html`: structure and controls.
- `style.css`: responsive layout, colors and typography.
- `physics.js`: seeded simulation engine.
- `app.js`: drawing, UI, image saving and video capture.
- `vendor/motion.js`: Motion 12.23.24, locally bundled.
- `vendor/MOTION-LICENSE.md`: upstream MIT license.
- `RESEARCH.md`: references, observed metrics and limitations.

The website uses system fonts, so there is no proprietary font redistribution. Change the `:root` values in `style.css` to adjust the interface palette. Change the canvas palette and labels in `app.js` for your own visual variations. You can edit and publish the supplied original site files; retain the upstream license when redistributing Motion.

## Scope

The package is ready for you to upload. No repository was created and nothing was published on your behalf.

## Verification

JavaScript syntax checks passed. The engine was checked across 36 combinations of experiment, seed and frame shape for finite positions, repeatable outcomes and termination; some ring runs correctly reach their time limit. The desktop layout and a browser recording reaching the downloadable-clip state were checked. The browser download tool stalled, so the exported video file was not independently played back. Mobile layouts are implemented but were not checked on a physical phone.
