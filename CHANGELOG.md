<!-- markdownlint-disable MD024 - each entry repeats the Added / Changed / Fixed headings -->
# Changelog

This file records notable changes to the Library Floorplans app. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 2026-09-25

Primo links are now handled entirely by the app, and `floorplans-broker.php` has been removed. On the production site they still go on to the library website, until its iframe is dropped. The app has shareable URLs and supports the browser's back and forward buttons. The floor loading code has been consolidated.

### Added

- **App URLs:** each view has a URL of the form `/{library}/{floor}/{shelf name}`, e.g. `/brotherton/m2/Philosophy`. Single-floor libraries leave out the floor, e.g. `/healthsciences/Pamphlets`.
- **Browser history:** loading a floor updates the URL and adds a history entry, and the back and forward buttons load the floor for that URL. Primo links and old URLs are replaced with the app URL on first load. When the app is embedded in an iframe (e.g. on the library website's locations page), it replaces the URL instead of adding entries, so the parent page's back button isn't affected.
- **Classmark matching:** Primo classmarks are matched to shelves in `routing.mjs`. This replaces `floorplans-broker.php`, and its special rules have been carried over. Shelves on the floor given in the link are checked first, then the rest of the library. If they disagree, the shelf's floor is used, which covers stock that has moved between floors. 97% of the Primo links in the live logs now resolve to a shelf, up from 76%.
- **`OccupancyControl`** is exported and added to the map like any other Leaflet control. It updates when the new `fpfloorloaded` event fires.
- **`loadFloor( floorid, shelfid, activate )`** in `core.mjs` is now the only code that loads and shows a floor.
- **New `SelecterControl` methods:** `buildLists( floorid )`, `selectFloor( floorid )`, `isOpen()` and `getPadding()`.
- **npm scripts:** `buildProd`, `buildDev`, `buildImages`, `serveprod` and `servepages`. `build` runs `buildStatic`, `buildProd` and `buildDev`.
- **Separate Content-Security-Policy** for the editor and IIIF pages.
- **Tests** (`npm test`) using Node's built-in test runner. They cover routing and classmark matching, browser history, the Primo redirect, `getJSON` caching, the floor data and the CSP hashes, and check the Primo links from the live logs. The pre-commit hook runs them on the staged files, and stops the commit if one fails.
- **`404.html`** loads the app, so app URLs work when reloaded under `jekyll serve` and on GitHub Pages.
- **GitHub Pages support:** the copy at https://uol-library.github.io/floorplans.library.leeds.ac.uk/ now works, including app URLs, under its subpath. `_config.yml` is the full base config, used on its own by GitHub Pages. The production (`_config_prod.yml`) and development (`_config-dev.yml`) configs now only contain the settings they override, and are layered over it. `npm run servepages` previews the GitHub Pages build locally.

### Changed

- **Selecter panel layout:** the panel fills the full height of the map. The open subjects or services list sizes to its content and scrolls when there isn't room, and the study areas list is capped at 25vh. List items are slightly smaller (`.875rem`).
- **The plans move for the selecter panel:** floors are fitted to the area of the map not covered by it, and the map pans when the panel is opened or closed.
- **Occupancy control:** it moved to the bottom right of the map. Its settings (`url`, `interval`, `libraries`) are now options, and its data is stored on the control instead of in `floorplans.occupancyData`.
- **`getJSON`** uses `fetch` and no longer takes a `callback` option. Its localStorage keys are prefixed with the site `version` from `_config.yml` (e.g. `floorplans-0.9-laidlaw-second`), and data cached by other versions is removed. A cached item that can't be parsed is fetched again. The new `clearStorage()` removes everything the app has cached, for when a user withdraws consent.
- **`addFloorLayer`** stores its promise on the floor, so each floor's image and GeoJSON are only fetched once.
- **`.htaccess`:** paths that aren't files are rewritten internally to `index.html`, without a redirect. Files that exist, including `.mjs` modules, are served as normal.
- **Content-Security-Policy:** updated for Leaflet 2 and the inline import map, which is allowed by its hash. `capacity.json` is allowed from the production site. `frame-ancestors` still allows `https://library.leeds.ac.uk`.
- **`_scripts/checkFeatures.js`** now runs as an ES module, and its messages include the filename.
- **Licence:** changed from MIT to the Apache License 2.0, to match `package.json`. The copyright notice is now in `NOTICE`.

### Fixed

- **Duplicate shelf IDs** in `laidlaw-second.json`. Geography, General Literature, General Science, Geology and Japanese shared IDs with other shelves.
- **Primo links with an unknown floor code** (e.g. `acq`, `net`, `llafr`) threw a script error.
- **Primo links with `&amp;`, a lower-case library code or a double-encoded classmark** failed to load a floor or shelf.
- **Health Sciences, Modern History, Chinese and journals classmarks** didn't match the current shelf names.
- **Shelves with brackets or other regex characters in their names**, such as `CD, DVD (All Subjects)`, couldn't be selected.
- **Shelves weren't highlighted after loading.** `selectFeature()` fired `mouseover`, but Leaflet 2 features listen for `pointerover`.
- **Two copies of the start floor were fetched and built at the same time** on startup.
- **List sorting:** shelves that shared a sort key could be put in the wrong order.

### Removed

- **`floorplans-broker.php`:** its redirect to the library website is now done by the app (`redirectPrimoLink()` in `routing.mjs`). This is turned on with `redirect_primo_links: true` in `_config_prod.yml`. The development and GitHub Pages sites open Primo links in the app directly, which is what production will do once the iframe on the library website is dropped.
- **`loadStartFloor()`, `selectShelf()`, `buildFeatureSelects()` and `sortFeatureSelects()`:** each has been replaced by one of the functions or methods above.

## 2026-09-23

The selecter became a native Leaflet 2.0 control, and the site is now built into `public/` and `public-dev/` and committed.

### Added

- **`SelecterControl`:** the floor selecter is now a native Leaflet 2.0 control, with `open()`, `close()` and `toggle()` methods.
- **Accordion lists:** the "Subjects on this floor" and "Services on this floor" lists can be opened and closed, and only one is open at a time.
- **Separate production and development builds** in `public/` and `public-dev/`, both committed to git. A pre-commit hook in `.githooks/pre-commit` rebuilds both from the staged files. After cloning, run `git config core.hooksPath .githooks` once.
- **`npm run serve`:** builds the site into `_site/` and serves it on localhost, using `_config-local.yml`.

### Changed

- **Selecter panel:** it slides completely off the map when closed, leaving only the menu button. Its contents are hidden from keyboard users while it's closed.
- **Lists:** a list is hidden when the floor has nothing in it. The subjects list opens when the floor has shelves, and otherwise the services list opens.
- **"Also on this floor" is now "Services on this floor".** The GeoJSON feature type `location` is now `service` in all 19 feature files.
- **`getJSON`** returns a promise, and only valid responses are cached.
- **The occupancy panel** only shows when data is available for the selected library.

### Fixed

- **Floors failed silently:** `addFloorLayer` now rejects if the floor image or its GeoJSON fails to load.
- **The editor and IIIF pages** no longer load the removed `assets/scripts/config.js`.
