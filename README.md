# J.A.G.A.C.E.

Just A Game About Combining Elements — an endless browser-based factory game.

## Development

Requires Node.js 20.19+ or 22.12+ (verified with Node 24).

```sh
npm ci --cache /tmp/jagace-npm
npm run dev -- --port 5173
```

```sh
npm test
npm run build
```

## Play

The starter factory produces earth and fire, combines them into lava, and sells it. Choose blocks in the shop and click an empty grid tile to place them. Producers emit on the element's timer. Conveyors carry elements in their arrow direction. Factories collect both ingredients and emit the recipe output every two seconds while supplied. Sellers accept every element.

Choose the recipe under Factory before placing it; building a factory unlocks its element's producer. More valuable elements cost more to produce. Explore recipes for all twenty combinations and twenty-four elements.

- **R**: rotate placement direction.
- Click a placed block with nothing selected: rotate its output.
- **Escape**: deselect.
- **Backspace / Delete**: toggle removal mode (50% refund).
- Right-click a block: remove it.
- **Space**: pause or resume.
- Toolbar: pause, 1× / 2× / 4× speed, reset view, and zoom.

Progress automatically saves in local browser storage. Start fresh asks for confirmation. There are no accounts, backend services, or credentials. Google Fonts are optional; system fonts work offline. Simulation stops when the browser tab is closed.

## Structure

- `src/engine.js`: economy, recipes, placement, transport, production, factory inventories.
- `src/main.js`: canvas rendering, controls, catalog, persistence.
- `src/engine.test.js`: functional simulation tests.
- `style.css`: responsive interface.

## GitHub Pages

The `Deploy J.A.G.A.C.E. to GitHub Pages` workflow tests and builds pushes to `main`, then deploys `dist` using GitHub Pages. Relative asset URLs also work under the `/jagace/` project path.

In repository **Settings → Pages**, choose **GitHub Actions** as the build source. If Pages was enabled after the first run, rerun the workflow from **Actions**. The site will be available at https://rhopman.github.io/jagace/ after a successful deployment.


## Element collection

Every element has a distinct vector illustration shared by its producer, moving cargo, catalog, and recipe guide. Factories show chimneys, windows, and an output-element badge; sellers are market stalls, and conveyors have animated treads and rollers.

New recipes include:

| Ingredients | Output |
| --- | --- |
| Earth + Dust | Sand |
| Clay + Water | Mud |
| Water + Wind | Ice |
| Steam + Wind | Cloud |
| Cloud + Water | Rain |
| Earth + Rain | Plant |
| Plant + Earth | Wood |
| Wood + Fire | Coal |
| Stone + Fire | Metal |
| Metal + Coal | Steel |
| Glass + Stone | Crystal |
| Fire + Wind | Energy |
| Plant + Energy | Life |
| Metal + Energy | Gold |

Existing browser saves remain compatible and retain their factories, balance, and discoveries.

## Connected conveyors

Select **Conveyor belt**, then press and drag across empty grid tiles. A continuous belt is built along the stroke, and corners turn automatically. Drag into an existing belt, factory, or seller to join it and finish the stroke; existing buildings are preserved. Each new belt costs ◈ 10. Individual placement and R/click rotation still work.

Conveyor graphics adapt to their actual incoming neighbors and output. Straight sections meet at tile edges, corners bend, and multiple incoming belts merge into the single arrow direction. Rotating or removing neighbors updates the visible connections immediately. Disconnected ends remain capped until connected.
