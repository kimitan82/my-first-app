# Copilot instructions

## Project overview

This repository is a dependency-free browser game prototype called **Skybound Runner**. It is a single-page HTML/CSS/JavaScript application; there is no framework, bundler, package manifest, or backend.

## Build, test, and lint

There are currently no repository-defined build, test, or lint commands. Run the app by opening `index.html` in a browser or serving the repository with any local static HTTP server. When validating changes, exercise the game in a browser, including keyboard movement, jumping, coin collection, enemy collision, falling, reaching the goal, and both restart controls.

For JavaScript-only syntax validation, use:

```bash
node --check script.js
```

There are no test selectors or single-test commands until an automated test suite is introduced.

## Architecture

- `index.html` defines the page shell, HUD, Canvas element, restart controls, game-over/win overlay, and keyboard-control instructions. It loads `style.css` and `script.js` directly.
- `style.css` owns the visual presentation: dark neon theme, responsive layout, HUD, overlay, and control hints. The Canvas itself is sized by its HTML attributes (`960x540`) and made responsive with CSS.
- `script.js` contains the complete game runtime. It keeps level data (`platforms`), mutable game state (`player`, `coins`, `enemies`, `cameraX`, `gameState`), physics/collision updates, Canvas rendering, HUD updates, and event listeners in one file.
- The world is wider than the viewport (`worldWidth = 4200`). The camera follows the player by translating the Canvas drawing context; gameplay coordinates remain in world space.
- `reset()` is the single initialization/restart path. `update()` advances gameplay only while `gameState === "playing"`, `draw()` renders the current state, and `loop()` schedules both with `requestAnimationFrame`.

## Repository-specific conventions

- Keep the three-layer split intact: structure in `index.html`, presentation in `style.css`, and behavior/data in `script.js`. Do not add inline styles or inline scripts for game features.
- Use the existing DOM IDs (`gameCanvas`, `coinCount`, `statusText`, `gameMessage`, `messageTitle`, `messageDetail`, `restartButton`, and `messageButton`) when wiring UI. If an ID changes, update every reference in both HTML and JavaScript.
- Use world-space coordinates for platforms, coins, enemies, the player, and the goal. Apply `cameraX` only during rendering, not to collision or movement calculations.
- Add or modify level content through the data arrays near the top of `script.js`; preserve the `x`, `y`, `w`, and `h` rectangle shape expected by collision and rendering code.
- Preserve the current game-state vocabulary: `"playing"`, `"won"`, and `"lost"`. Route both failure and success through `endGame()` so the overlay and status HUD stay synchronized.
- Keep restart behavior routed through `reset()` so all mutable entities and camera position are restored consistently.
- The UI uses Japanese user-facing text alongside English game labels. Preserve that mixed-language style and update visible instructions when controls change.
- 説明は日本語で表示するようにして。
- The project currently uses plain browser APIs and external Google Fonts loaded from CSS. Avoid introducing dependencies or a build step unless the project is intentionally expanded beyond the current MVP.
