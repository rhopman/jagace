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

The starter factory produces earth and fire, combines them into lava, and sells it. Choose blocks in the shop and click an empty grid tile to place them. Producers emit on the element's timer. Conveyors carry elements in their arrow direction. Factories collect both ingredients and emit the recipe output while supplied. Basic recipes take two seconds per batch; each additional recipe tier adds 0.6 seconds. Sellers accept every element.

Choose the recipe under Factory before placing it; both ingredients must be discovered first. Craft three batches to discover its output and unlock that element’s producer. More valuable elements cost more to produce. Explore recipes for all twenty combinations and twenty-four elements.

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

Every element has a distinct vector illustration shared by its producer, moving cargo, catalog, and recipe guide. Factories show chimneys, windows, and an output-element badge; sellers are holographic trading terminals, and conveyors have animated treads and rollers.

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

## Side view

The playground shows a side elevation of a workshop with nine build levels. Producers are materializer chambers, factories are fusion reactors, and sellers are holographic trading terminals. Horizontal conveyors have visible rollers and raised decks; vertical conveyors become lift shafts with animated carriers. Connected horizontal and vertical routes transfer elements between levels.

The placement grid appears when building or removing blocks. This is a visual change: previous layouts, directions, recipes, inventories, money, and browser saves continue to work. Every conveyor still costs ◈ 10, including lifts. The page and workshop backgrounds remain white.


## Anti-gravity factory

All buildings sit on repulsor bases with cyan energy fields and animated levitation rings. Maglev conveyor decks replace support legs, and illuminated lift shafts move items between levels. Factory buildings are fusion reactors, producers hold their elements in stasis chambers, and sellers use holographic trade displays. Matching shop illustrations identify each building.

The workshop displays an anti-gravity status indicator and the help guide explains the hover technology. A gentle, synchronized hover animation keeps connected transport aligned; it respects the browser's reduced-motion preference. Simulation pauses also freeze hover motion. The background remains white and existing saves remain compatible.


## Progression and difficulty

New games start with ◈ 500 and a working lava line. Only earth, wind, fire, and water are initially discovered. An element is discovered after three successful factory batches; then its producer can be purchased. Factory recipes require their ingredients to be discovered, so late-game elements must be reached through the recipe chain.

Factory costs start at ◈ 180 and increase by ◈ 60 for each additional recipe tier. Processing starts at two seconds and increases by 0.6 seconds per tier. Recipe depth is derived from its ingredients. The shop and recipe notebook show costs, processing times, ingredient requirements, and discovery progress.

Existing saves keep their money, layouts, and producer unlocks. Newly discovered elements use the tougher progression. New purchases record their actual cost for 50% refunds; old factory purchases retain their original ◈ 150 valuation. Use Start fresh for the smaller starting budget and the complete new progression.
