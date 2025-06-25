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

## Future plans

The floorplans can be integrated with [spacefinder](https://spacefinder.leeds.ac.uk/) once they have been georeferenced. However, georeferencing the plans means that all the GeoJSON for the shelves needs to be georeferenced as well, and all text and icons removed from the images.

### Georeferencing using Allmaps

[Allmaps](htps://allmaps.org/) makes it easier to curate, georeference and explore collections of digitized maps, but can also be used to georeference any IIIF images. The floorplan images have been converted to IIIF Level0 images for this purpose, retaining their shelving as IIIF Annotations (with many thanks to [Jules Schoonman](https://www.tudelft.nl/en/staff/j.a.schoonman/) who helped with the initial conversion of the plans to SVG files, and has helped me a great deal with the georeferencing of the plans).

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

Both the Health Sciences library and the West wing of the Brotherton are proving tricky because I'm not sure where exactly they are on OpenStreetMap(!). The same applies to St. James Hospital library, but I don't have the plans for that one (yet).
