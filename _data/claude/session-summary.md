# Session summary: 23 and 25 September 2026

These notes cover two Claude Code sessions that refactored the floorplans app on the `develop` branch, after it moved to Leaflet 2.0 and ES modules. `CHANGELOG.md` at the root of the repo has a shorter list of the same changes.

- **23 September:** made the selecter a native Leaflet control with accordion lists, made `getJSON` return a promise, renamed the `location` feature type to `service`, and set up the committed `public/` and `public-dev/` builds with a pre-commit hook.
- **25 September:** covers the selecter and occupancy controls, floor loading, `getJSON`, the layout, the build scripts, routing for Primo links (replacing `floorplans-broker.php`), URLs and browser history, shelf data fixes, and the Content-Security-Policy and iframe embedding.

The 23 September work and the first part of 25 September are committed, in `186718a`, `ebcbae1` and `a4d9865`. Everything from section 7 onwards is **not committed yet**.

## Contents

0. [23 September session](#0-23-september-session)
1. [Selecter control](#1-selecter-control)
2. [Occupancy control](#2-occupancy-control)
3. [Floor loading](#3-floor-loading)
4. [getJSON](#4-getjson)
5. [Layout and CSS](#5-layout-and-css)
6. [Build scripts](#6-build-scripts)
7. [Primo links and routing](#7-primo-links-and-routing)
8. [URLs and browser history](#8-urls-and-browser-history)
9. [Shelf data fixes](#9-shelf-data-fixes)
10. [Content-Security-Policy and iframe embedding](#10-content-security-policy-and-iframe-embedding)
11. [Open issues and follow-ups](#11-open-issues-and-follow-ups)

---

## 0. 23 September session

Some of this was reworked later, on 25 September (sections 1 to 5).

- **Native Leaflet control:** `setupSelecterControl()` became `SelecterControl extends Control`. It builds its own panel, including the menu button that used to be static HTML in `_layouts/floorplans.html`. It stops clicks and scrolling inside the panel from moving the map, and has `open()`, `close()` and `toggle()` methods. The menu button has `aria-controls`, `aria-expanded` and a hidden label that switches between "Close" and "Open".
- **Accordion lists:** the subjects and services list headings are buttons, and only one list is open at a time. The open or closed state is a `collapsed` class on the list's container, so it carries over between floors. A list is hidden when the floor has nothing in it. The subjects list opens whenever the floor has shelves, and otherwise the services list opens.
- **Panel off screen:** when closed, the panel slides completely off the map, and only the menu button stays visible. Its contents are hidden once it has slid away, so keyboard users can't tab into them.
- **`location` renamed to `service`:** 143 GeoJSON features across 19 files changed type from `location` to `service`. The list heading changed from "Also on this floor" to "Services on this floor", and the code and CSS were updated to match (`serviceselecter`, `.servicebutton`).
- **`getJSON`:** it returns a promise, and only valid responses are cached. `addFloorLayer` rejects if the floor image or its GeoJSON fails to load.
- **Occupancy panel:** it's hidden unless data has loaded for the selected library, e.g. when running locally.
- **Builds:**
  - `public/` (production, `_config.yml`) and `public-dev/` (development, `_config-dev.yml`) are both committed.
  - `.githooks/pre-commit` rebuilds both from the staged files and adds them to the commit. Each clone needs `git config core.hooksPath .githooks`. The hook can be skipped with `SKIP_JEKYLL_BUILD=1` or `--no-verify`.
  - `npm run serve` builds into `_site/` with `_config-local.yml`, which leaves both committed builds untouched.
  - The README has a "Building the site" section.
- **Editor and IIIF pages:** `editor-head.html` no longer loads the removed `assets/scripts/config.js`. This was done by hand, not in the session.

## 1. Selecter control

File: `assets/js/modules/selectercontrol.mjs`

- **`buildLists( floorid )`** builds and sorts the area, shelf and service lists for a floor, then sets the accordion state. It replaced the exported `buildFeatureSelects()` and `sortFeatureSelects()` functions, which are now the private methods `_buildList()` and `_sortList()`. The sort now reorders the list items directly, so shelves that share a sort key are no longer lost or misordered.
- **`selectFloor( floorid )`** moved here from `utilities.mjs`. It selects the floor in the drop-down without firing a `change` event.
- **`isOpen()`, `getPadding()` and `_panForPanel()`** let the plans make room for the panel. Opening or closing the panel pans the map by half the panel's width, and `getPadding()` gives the `paddingTopLeft` value for `fitBounds`.
- **`_onFloorChange`** now just calls `loadFloor( floorid, null, true )`.
- **`_createList`** adds the classes `selecter__group` and `selecter__group--toggleable`, which the layout CSS uses.

## 2. Occupancy control

File: `assets/js/modules/occupancycontrol.mjs`

- **It's now a regular exported `OccupancyControl`.** It's added in `initMap()` with `new OccupancyControl().addTo( map )`, instead of being set up inside an `fpmapready` listener.
- **Options:** `position` (now `bottomright`), `url`, `interval` and `libraries`.
- **`onAdd` and `onRemove`:** `onAdd` starts listening for the `fpfloorloaded` event and starts the refresh timer. `onRemove` removes both.
- **State:** the data is stored on the control instead of in the global `floorplans.occupancyData`. `showMessage()` matches libraries by floor ID prefix, so there are no hardcoded Edward Boyle or Laidlaw checks.

## 3. Floor loading

File: `assets/js/modules/core.mjs`

- **`loadFloor( floorid, shelfid, activate )`** is the single place a floor is loaded and shown. It moved from `utilities.mjs`, where it had several bugs. When `activate` is true it:
  - swaps the floor layer and fits it into the map area not covered by the panel;
  - builds the lists and selects the floor in the drop-down;
  - highlights the shelf;
  - dispatches the `fpfloorloaded` event with `{ floor, layer, shelfid }`.

  If floors are requested in quick succession, a slow earlier load can't replace a later one.
- **`addFloorLayer()`** stores its promise on the floor as `floor.layerPromise`. Each floor's image and GeoJSON are only fetched once, even with calls running at the same time. The promise is cleared if loading fails, so it can be retried.
- **Startup:** `initMap()` loads the start floor from the URL, then preloads all the other floors. `loadStartFloor()` has been removed.
- **`selectShelf()` has been removed.** It treated shelf names as regexes. Shelves are now highlighted by ID with `selectFeature()`, which now fires `pointerover` instead of `mouseover`, the event Leaflet 2 features listen for.

## 4. getJSON

File: `assets/js/modules/utilities.mjs`

- **It uses `fetch` in an `async` function.** It still caches in localStorage and rejects with `{ status, statusText }`.
- **The unused `callback` option has been removed.** Every caller uses `.then()`.
- **Fixes:**
  - A request missing its key or URL now stops immediately. Before, it rejected but carried on.
  - Invalid JSON now rejects. Before, the promise never settled.
  - The caller's `options` object is no longer modified.

## 5. Layout and CSS

File: `assets/css/modules/leaflet-controls.css`

- **Full height:** the selecter control takes the full height of the map (`100dvh`) and uses a flex column layout.
- **Lists:**
  - The study areas list is capped at `25vh`.
  - The open subjects or services list sizes to its content, then shrinks and scrolls if there isn't room. The services heading stays directly under the subjects list.
  - The old `min-height` media queries that capped the lists have been removed.
- **Font size:** the list buttons have an explicit `font-size`, set to `.875rem`.
- **Occupancy control:** it moved to the bottom right, with `max-width: 30em`.

## 6. Build scripts

File: `package.json`

| Script | Does |
|---|---|
| `buildStatic` | Runs the PNG compression, the feature map script and the icons script (this was the old `build`) |
| `buildPublic` | `jekyll build --config _config.yml`, which builds `public/` |
| `buildDev` | `jekyll build --config _config-dev.yml`, which builds `public-dev/` |
| `build` | Runs all three in order |

## 7. Primo links and routing

Files: `assets/js/modules/routing.mjs` and `.htaccess`. `floorplans-broker.php` has been deleted.

### Log analysis

The live access log (about 420k requests) gave:

- 1,547 unique Primo links of the form `/floorplan?library=…&floor=…&classmark=…`. These come from `leeds.primo.exlibrisgroup.com`.
- About 2,300 old URLs of the form `/{library}/floors/{floor}/?classmark=…`.

The broker used to redirect Primo links to the library website's locations page. They're now handled directly by the app.

### Matching classmarks to shelves

`getShelfFromClassmark()` matches classmarks against the shelf names in `floorplans.featureMap`:

- **Candidate names** come from the classmark, using the broker's rules:
  - Video → DVD, and Atlas Case → Atlases;
  - on Brotherton W2 and W2a, journals, "Large" and "Stack Large" items go to their shared shelves;
  - Current Periodicals on W3;
  - `<subject> A-0.01` → `<subject> Journals`, then the floor's Journals shelf;
  - Pamphlets and Large items go to the subject shelf when the floor has no Pamphlets or Large shelf;
  - Health Sciences class codes, Pamphlets and AVC;
  - Owen Lattimore Collection → Lattimore, and Holden Library → Holden.
- **Shelf names:**
  - Letter ranges are respected, e.g. `Modern History A-R`/`S-Z` and `Chinese E-V`/`V-Z`.
  - Comma-separated names and names with brackets are split up.
  - Health Sciences shelves are matched by their code, e.g. `WA - …`.
  - Spelling differences are smoothed over: Communications/Communication, Scandanavian and Portugese.
- **Where it looks:** the floor given in the Primo link is checked first, then the rest of the library. Generic shelves (Large, Journal(s), Stack, Pamphlets and so on) are only matched on the floor given. When several shelves match, the most specific one wins.
- **The shelf's floor overrides Primo's floor code.** This covers books that moved between floors over the summer. Only generic shelves appear on more than one floor, so a stale floor code can't pull a link back to the old floor.
- **Link problems handled:** `&amp;` in links, lower-case library codes, double encoding, `{call_number}` placeholders that were never filled in, unknown floor codes (these used to throw an error) and Health Sciences classmarks linked from other libraries.
- **No usable floor:** if the library is known but the floor isn't, the link falls back to the library's first floor.

### Results for the 1,547 Primo links

| | Before | After |
|---|---|---|
| Matched to a shelf | 1,177 | 1,498 (97%) |
| Floor only | 358 | 47 |
| No floor | 5 | 2 |
| Script errors | 7 | 0 |

55 matches are on a different floor from Primo's floor code, probably because of the moves. They're mostly Laidlaw `ll1` links.

**Still not matched:**
- **Floors with no shelves in the data:** Laidlaw HDC and Edward Boyle level 9 (Wellbeing).
- **Shelves missing from the data:** Skills (Laidlaw first floor), Archaeology Journals (W2a) and EDC (Edward Boyle level 8).
- **Outside the app:** Special Collections.
- **Nothing to match:** empty classmarks.

## 8. URLs and browser history

Files: `assets/js/modules/routing.mjs`, `core.mjs` and `.htaccess`

- **URL format:** `/{library}/{floor}/{shelf name}`, e.g. `/brotherton/m2/Philosophy`. Single-floor libraries leave out the floor, e.g. `/healthsciences/Pamphlets`. A shelf name that doesn't exactly match falls back to the classmark matcher.
- **`getStartParams()`** reads `location.pathname`, and still accepts `?path=`. It handles:
  - app URLs;
  - Primo links;
  - old `/floors/` URLs;
  - old `#library/floor/shelf` hashes.
- **`getFloorURL( floorid, shelfid )`** builds the app URL.
- **`initHistory( navigate )`** keeps the URL and history in step with the floor:
  - On the first floor load it replaces the current history entry, so a Primo link becomes the clean URL.
  - Later floor changes each add a new entry.
  - `popstate` loads the floor for the URL. `core.mjs` passes `loadFloor` in as the callback, which avoids a circular import.
- **`.htaccess`:** the catch-all rule is now an internal rewrite to `index.html`, with no 302 redirect, so the address bar keeps the real URL. Files and folders that exist, including the `.mjs` modules, are served as normal, and missing assets still return a 404.
- **Tests:** all 578 build-and-parse checks (289 shelves, with and without a shelf) give back the same floor and shelf.

## 9. Shelf data fixes

- **`assets/features/laidlaw-second.json`:** five shelves had duplicate IDs. They were renumbered to fill the gaps in the sequence: Geography 4→13, General Literature 5→14, General Science 7→15, Geology 9→16 and Japanese 10→22. `features.js` has been regenerated.
- **`_scripts/checkFeatures.js`:** converted to ES modules, since `package.json` sets `"type": "module"`, and its messages now include the filename. It currently reports no problems.

## 10. Content-Security-Policy and iframe embedding

Files: `.htaccess`, `_includes/head.html`, `_includes/editor-head.html` and `routing.mjs`

- **The live site enforces the CSP.** It runs Apache 2.4 with `mod_headers`, and the old policy only allowed Leaflet 1.9.3, so it would have blocked the new build.
- **App policy:**
  - Leaflet 2.0.0-alpha.1 is allowed from unpkg (script, stylesheet and images).
  - The inline import map is allowed by its sha256 hash, so `'unsafe-inline'` isn't needed.
  - `connect-src` allows `'self'` and the production domain, for `capacity.json`.
  - Objects, workers, media and frames are set to `'none'`.
  - `frame-ancestors` allows `'self'` and `https://library.leeds.ac.uk`.
- **Editor and IIIF policy:** an Apache `<If>` block for `/editor/` and `/iiif/` allows Leaflet 1.9.3, Geoman, Polydraw and a11y-dialog, plus that page's import map hash. Inline styles are allowed on these pages only. They can only be framed by the site itself.
- **Hashes:** checked against a fresh Jekyll build. Comments in both head includes say the hash must be updated if the import map changes.
- **Library website iframe:** the locations page on `https://library.leeds.ac.uk` embeds the app with fixed old-style URLs, one per library: `/brotherton/floors/m3/`, `/edwardboyle/floors/9/`, `/healthsciences/floors/` and `/laidlaw/floors/ground/`. All four load the right floor. Inside an iframe, `initHistory()` replaces the URL instead of adding history entries, because an iframe shares its history with the parent page.

## 11. Open issues and follow-ups

- **Test before deploying:**
  - Load `/editor/` and look for CSP errors in the console, because the editor's policy hasn't been tested in a browser.
  - After deploying to the dev site, test the library website's iframe.
- **Cached floor data:** GeoJSON is cached in localStorage for 24 hours under the floor ID. Returning visitors may see the old Laidlaw second floor IDs for up to a day. Adding the site version to the cache key would fix this.
- **Local development:** `jekyll serve` doesn't read `.htaccess`, so reloading a deep URL such as `/brotherton/m2` returns a 404 locally. A `404.html` that loads the app would fix it.
- **Primo data:**
  - Some links contain `{call_number}` where the classmark should be.
  - The floor codes `acq`, `net` and `llafr` aren't mapped to any floor. Ask the Primo team what they should point to.
- **Missing shelves:** Laidlaw HDC and Edward Boyle level 9 have no shelves in the data, and Skills, Archaeology Journals and EDC have no shelf.
- **`_data/test_urls.json` is not valid JSON.** There's a comma after the last URL in its first group, which could break `tests.md`.
- **Uncommitted work:** everything from section 7 onwards. The pre-commit hook rebuilds `public/` and `public-dev/` when you commit, or you can run `npm run build`.
- **The editor's floor selecter** has no `.catch`, so a failure to load a floor shows as an unhandled promise rejection in the console. This is from 23 September.
- **URL behaviour:** only floor loads change the URL; highlighting a shelf doesn't. Going back to a URL with no floor, such as `/`, leaves the current floor on screen.
