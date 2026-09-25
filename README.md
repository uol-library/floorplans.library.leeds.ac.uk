# Library Floorplans service

## Background

The Library has 4 comprehensive interactive floor plans for the following sites:

* Brotherton
* Edward Boyle
* Health Sciences
* Laidlaw

The floorplans provide a detailed breakdown of the location of the Library's collection and are used to indicate to Library users the location of items following a search of the Library Catalogue. 

Floorplans are publicly visible on the Library website at https://library.leeds.ac.uk/locations through iframes, but also directly at:

### Brotherton

* https://floorplans.library.leeds.ac.uk/brotherton/floors/m1/ (main building, level 1)
* https://floorplans.library.leeds.ac.uk/brotherton/floors/m2/ (main building, level 2)
* https://floorplans.library.leeds.ac.uk/brotherton/floors/m3/ (main building, level 3)
* https://floorplans.library.leeds.ac.uk/brotherton/floors/m3/ (main building, level 4)
* https://floorplans.library.leeds.ac.uk/brotherton/floors/w2/ (main building, level 2)
* https://floorplans.library.leeds.ac.uk/brotherton/floors/w3/ (west building, level 3)

### Edward Boyle

* https://floorplans.library.leeds.ac.uk/edwardboyle/floors/8/ (level 8)
* https://floorplans.library.leeds.ac.uk/edwardboyle/floors/9/ (level 9)
* https://floorplans.library.leeds.ac.uk/edwardboyle/floors/10/ (level 10)
* https://floorplans.library.leeds.ac.uk/edwardboyle/floors/11/ (level 11)
* https://floorplans.library.leeds.ac.uk/edwardboyle/floors/12/ (level 12)
* https://floorplans.library.leeds.ac.uk/edwardboyle/floors/13/ (level 13)

### Health Sciences

* https://floorplans.library.leeds.ac.uk/healthsciences/floors/

### Laidlaw

* https://floorplans.library.leeds.ac.uk/laidlaw/floors/ground/ (ground floor)
* https://floorplans.library.leeds.ac.uk/laidlaw/floors/first/ (first floor)
* https://floorplans.library.leeds.ac.uk/laidlaw/floors/second/ (second floor)
* https://floorplans.library.leeds.ac.uk/laidlaw/floors/third/ (third floor)

## What is in this repository?

This repository contains a refactored version of the floorplans which adopts the following changes:

* All floors for all libraries are served by a single static web app
* Data for each floor is loaded in the form of an image file (for the floor layout) and GeoJSON data file (for shelves and other points of interest).
* Tools to select floors and highlight shelves are added via a custom Leaflet control

## Building the site

The site is built with Jekyll. `_config.yml` holds the full configuration, and the other sites layer a small file of overrides over it (Jekyll merges the config files in the order given):

| Configs | Output | Served at |
|---|---|---|
| `_config.yml` | built by GitHub Pages | https://uol-library.github.io/floorplans.library.leeds.ac.uk/ |
| `_config.yml,_config_prod.yml` | `public/` (committed) | https://floorplans.library.leeds.ac.uk (Apache) |
| `_config.yml,_config-dev.yml` | `public-dev/` (committed) | https://dev-floorplans.library.leeds.ac.uk (Apache, debug logging enabled) |

GitHub Pages always builds the site itself using `_config.yml` alone, so that file is set up for GitHub Pages, which serves the site from a subpath (`baseurl: /floorplans.library.leeds.ac.uk`). `_config_prod.yml` and `_config-dev.yml` only change the `url`, `baseurl` and `destination` (and `environment` for development), so shared settings only need changing in `_config.yml`.

A pre-commit hook in `.githooks/` rebuilds `public/` and `public-dev/` from the staged files and adds the output to the commit. Enable it once after cloning with:

```sh
git config core.hooksPath .githooks
```

To skip the build for a single commit, use `SKIP_JEKYLL_BUILD=1 git commit ...`.

To build each site manually:

```sh
npm run buildProd    # public/
npm run buildDev     # public-dev/
```

To create the icons and features data files and build both sites:

```sh
npm run build
```

To rebuild the image files from their sources, use `npm run buildImages`.

To run the site locally without touching either build directory, use one of the following. Each layers `_config-local.yml` last and builds into `_site/`, which is not committed:

```sh
npm run serve        # development config, at http://localhost:4000/
npm run serveprod    # production config, at http://localhost:4000/
npm run servepages   # GitHub Pages config, at http://localhost:4000/floorplans.library.leeds.ac.uk/
```

### App URLs

The app uses URLs like `/brotherton/m2/Philosophy` (library, floor and shelf name), which change as floors are selected. On the Apache sites, `.htaccess` serves `index.html` for these paths. On GitHub Pages and with `jekyll serve`, `404.html` loads the app instead (the page works, but the HTTP status is 404).

## Future plans

The floorplans can be integrated with [spacefinder](https://spacefinder.leeds.ac.uk/) once they have been georeferenced. However, georeferencing the plans means that:

- all text and icons need to be removed from the images, and the images converted to SVG (complete).
- images and all GeoJSON features need to be georeferenced (partially complete).
- icons need to be added to the floorplans for stairs, lifts, fire exits, etc.
- navigation on the floorplans needs to be added so you can switch more easily between floors.
- Brotherton floorplans for levels 2 and 3 _may_ need to be merged with the west building.
- geolocation needs to be changed so if someone loads spacefinder in a library - it shows them where they are on which floor.

### Georeferencing using Allmaps

[Allmaps](htps://allmaps.org/) makes it easier to curate, georeference and explore collections of digitized maps, but can also be used to georeference any IIIF images. The floorplan images were converted to IIIF Level0 images for this purpose, retaining their shelving as IIIF Annotations (with many thanks to [Jules Schoonman](https://www.tudelft.nl/en/staff/j.a.schoonman/) who helped with the initial conversion of the plans to SVG files, and has helped me a great deal with the georeferencing of the plans).

The IIIF versions of the original floorplans, along with a new set of images which have been made in order to make georeferencing easier, are available here:

https://uol-library.github.io/floorplans.library.leeds.ac.uk/iiif/

The URLs of the manifests of these images can then be used in the [Allmaps editor](https://editor.allmaps.org/) to georeference them. They can then be previewed in the [Allmaps viewer](https://viewer.allmaps.org). These are the results so far:

#### Edward Boyle level 13:

* https://viewer.allmaps.org/?url=https://annotations.allmaps.org/images/969bdf8c4a184130
* https://annotations.allmaps.org/images/969bdf8c4a184130
* https://annotations.allmaps.org/images/969bdf8c4a184130.geojson
* https://allmaps.xyz/images/969bdf8c4a184130/{z}/{x}/{y}@2x.png

#### Brotherton Main level 1

* https://viewer.allmaps.org/?url=https://annotations.allmaps.org/images/33166be070f36f94
* https://annotations.allmaps.org/images/33166be070f36f94
* https://annotations.allmaps.org/images/33166be070f36f94.geojson
* https://allmaps.xyz/images/33166be070f36f94/{z}/{x}/{y}@2x.png

#### Laidlaw ground

* https://viewer.allmaps.org/?url=https://annotations.allmaps.org/images/447034c419b2ef5b
* https://annotations.allmaps.org/images/447034c419b2ef5b
* https://annotations.allmaps.org/images/447034c419b2ef5b.geojson
* https://allmaps.xyz/images/447034c419b2ef5b/{z}/{x}/{y}@2x.png

Both the Health Sciences library and the West wing of the Brotherton are proving tricky because I'm not sure where exactly they are on OpenStreetMap(!).

### Icons

The floorplans have started using an icon font made using fontello. All the files needed for the font are in the `assets/font/src` folder, including any custom icons and the fontello configuration file. In addition, icons are included in the plans as inline SVG overlays - these are generated from a set of SVG icons in the `assets/icons` folder, which are in turn generated either using FontForge or [https://iconly.io/tools/font-to-icons-converter](https://iconly.io/tools/font-to-icons-converter).