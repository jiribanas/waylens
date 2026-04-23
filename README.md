# WayLens

Wayfinder route overlay for Even Realities G2 smart glasses.
Proof-of-concept for Acuity Brands Innovation Day: the Wayfinder SDK's
route visualisation, rendered directly in the optics of the G2.

Everything happens on the glasses — FROM/TO POI selection at MIA
Terminal D, route overview, and step-by-step navigation. No phone UI
interaction is required (or even visible) during the demo.

![WayLens home screen](docs/home.png)

## What the demo does

1. Launch the plugin from the Even Realities App. The glasses show a
   `WAYLENS` home screen.
2. Press the temple pad (or R1 ring) to open the FROM list. Swipe up /
   down to scroll through MIA Terminal D POIs (gates, lounges,
   restaurants). Press to select.
3. Pick a TO POI the same way.
4. For `D30 -> Starbucks` the glasses render a Wayfinder-style route
   overview (corridor diagram, polyline, FROM dot, TO bullseye, distance
   and time).
5. Swipe down to walk through the four zoomed-in step images, each
   showing a short corridor slice with a directional chevron. Swipe up
   to go back one step; swipe up past the first step returns to the
   overview. Double-press returns to home at any time.
6. Any other FROM/TO pair politely shows a demo-route-unavailable
   screen.

## How it's built

- Even Hub plugin: TypeScript + Vite running inside the Even Realities
  App WebView. The phone-side DOM is a one-line status indicator; it is
  only visible if you happen to open the plugin's WebView directly.
- Uses `@evenrealities/even_hub_sdk` 0.0.10 for the native bridge.
  Display is composed from:
  - `TextContainerProperty` for headers, footers, and the invisible
    full-screen event-capture container.
  - `ListContainerProperty` for the POI picker (firmware-native
    highlight + scrolling).
  - `ImageContainerProperty` for the 200x100 route image (4-bit grey
    quantisation is applied by the SDK).
- Route visuals are rendered at runtime on a 200x100 `<canvas>`, exported
  as PNG bytes, and pushed to the glasses via `updateImageRawData`.
  Step images are pre-rendered once per route and cached, so swipes
  reuse `textContainerUpgrade` + `updateImageRawData` (no layout rebuild).

See [the plan](../.cursor/plans/waylens_g2_poc_cb0c175a.plan.md) for the
full design.

## Project layout

```
src/
  main.ts                 # plugin entry: wait for bridge, go to Home
  state.ts                # typed state machine + transitions
  phoneUI.ts              # one-line DOM status
  bridge/
    glasses.ts            # showPage / upgradeText / updateImage wrappers
    events.ts             # onEvenHubEvent dispatcher (temple + R1)
  data/
    pois.ts               # hardcoded MIA Terminal D POIs
    routes.ts             # D30 -> Starbucks step list
  rendering/
    canvasUtils.ts        # canvas -> PNG, grey palette
    corridor.ts           # reusable concourse diagram primitive
    overviewImage.ts      # full-route image
    stepImage.ts          # zoomed step image (+ cache)
  screens/
    home.ts
    poiList.ts            # shared FROM/TO list screen
    routeLayout.ts        # shared header/footer/image layout
    overview.ts
    step.ts
    arrived.ts
    routeUnavailable.ts
app.json                  # plugin manifest
index.html                # WebView entry (DOM is minimal by design)
```

## Requirements

- Node.js 20 LTS or 22+ (required by `@evenrealities/even_hub_sdk`).
- The Even Realities iPhone app, signed in, for hardware testing.
- Optional: Even G2 glasses and Even R1 ring.

## Getting set up

```bash
npm install
npm install -g @evenrealities/evenhub-simulator @evenrealities/evenhub-cli
```

## Run in the simulator

```bash
npm run dev         # Vite dev server on 0.0.0.0:5173
npm run sim         # launches evenhub-simulator http://localhost:5173
```

The simulator window will show the green glasses canvas. The simulator
emits all four touchpad gestures from the Touchpad panel (press, double
press, swipe up, swipe down). If you want to drive it programmatically
for AI-assisted testing, launch it with `--automation-port 9898`:

```bash
evenhub-simulator --automation-port 9898 http://localhost:5173
```

Then:

```bash
curl http://localhost:9898/api/ping                          # pong
curl -s -o glasses.png http://localhost:9898/api/screenshot/glasses
curl -X POST -H 'Content-Type: application/json' \
     -d '{"action":"click"}' http://localhost:9898/api/input
# action ∈ "click" | "double_click" | "up" | "down"
curl -s 'http://localhost:9898/api/console?since_id=0'       # logs
```

## Run on real Even G2 glasses via QR sideload

1. Make sure the phone and laptop are on the same Wi-Fi network and that
   the phone has the Even Realities app installed and signed in.
2. Start the Vite dev server: `npm run dev`.
3. Generate a QR code pointing at your LAN IP:

   ```bash
   npm run qr
   # equivalent to: evenhub qr --url http://$(ipconfig getifaddr en0):5173
   ```

4. Scan the QR code with the Even Realities app ("Developer" -> "Load
   from URL"). The plugin starts on the glasses and hot-reloads on every
   save.

Tips and known constraints when running on the hardware:

- Keep image sends serial (`await updateImageRawData`). WayLens does
  this and also pre-renders step images at app start so each swipe only
  transfers 200x100 PNG bytes over BLE.
- If step transitions feel laggy on the device, drop the image to a
  smaller footprint (e.g. 160x80) inside `rendering/canvasUtils.ts`.
  The display container `xPosition` / `yPosition` in
  `screens/routeLayout.ts` should be adjusted to keep the map centred.
- Border-colour `0` is invisible and matches the real firmware; the
  simulator used to default to visible white borders but now matches
  this behaviour.

## Packaging for distribution

```bash
npm run pack        # npm run build + evenhub pack app.json dist -o waylens.ehpk
```

`waylens.ehpk` can be uploaded to the Even Hub developer portal for
private-build testing, or submitted for public review.

## Screens in the demo

The build has been exercised end-to-end in the simulator. Representative
frames:

| Screen            | What it shows                                                     |
|-------------------|-------------------------------------------------------------------|
| Home              | Title, instructions for temple/ring input                          |
| FROM / TO list    | Scrollable list of 15 MIA Terminal D POIs with category glyphs     |
| Overview          | Header, full-route corridor image, distance/time, hint to swipe    |
| Step 1            | "Exit D30, turn left" with zoomed 3-gate slice + left chevron      |
| Step 2            | "Continue west past D20" - 320 m segment                           |
| Step 3            | "Pass D15, Starbucks on the right" - 280 m segment                 |
| Step 4            | "Arrive at Starbucks" - 80 m approach                              |
| Arrived           | Completion summary and exit hint                                   |
| Route unavailable | Fallback when the selected pair is not the demo route              |

## Extending beyond the POC

This demo is deliberately the bare minimum. To make it production-ready:

- Replace the hardcoded POI/route data with a live subscription to the
  Wayfinder iOS SDK's navigation stream (`LLNavigationPath`,
  `LLWaypoint`, `LLNavigationPoint`).
- Stream real position updates from `LLPositionManager` (or the Atrius
  Navigator/Locator SDK) to re-render the step image when the user's
  waypoint changes, so the glasses track the wearer in real time.
- Add venue selection (currently hardcoded to MIA Terminal D) and
  multi-floor support (the Wayfinder `LLFloor` model + a small chrome
  in the step header).
- Use `bridge.imuControl` to orient the corridor view to the user's
  heading — the IMU data is already exposed by the SDK.
