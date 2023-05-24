Library Floorplans service
==========================

Background
----------

The Library has 4 comprehensive interactive floor plans for the following sites:

* Brotherton
* Edward Boyle
* Health Sciences
* Laidlaw

The floorplans provide a detailed breakdown of the location of the Library's collection and are used to indicate to Library users the location of items following a search of the Library Catalogue. 

Floorplans are publicly visible on the Library website at https://library.leeds.ac.uk/locations through iframes, but also directly at:

**Brotherton**

* https://floorplans.library.leeds.ac.uk/brotherton/floors/m1/ (main building, level 1)
* https://floorplans.library.leeds.ac.uk/brotherton/floors/m2/ (main building, level 2)
* https://floorplans.library.leeds.ac.uk/brotherton/floors/m3/ (main building, level 3)
* https://floorplans.library.leeds.ac.uk/brotherton/floors/m3/ (main building, level 4)
* https://floorplans.library.leeds.ac.uk/brotherton/floors/w2/ (main building, level 2)
* https://floorplans.library.leeds.ac.uk/brotherton/floors/w3/ (west building, level 3)

**Edward Boyle**

* https://floorplans.library.leeds.ac.uk/edwardboyle/floors/8/ (level 8)
* https://floorplans.library.leeds.ac.uk/edwardboyle/floors/9/ (level 9)
* https://floorplans.library.leeds.ac.uk/edwardboyle/floors/10/ (level 10)
* https://floorplans.library.leeds.ac.uk/edwardboyle/floors/11/ (level 11)
* https://floorplans.library.leeds.ac.uk/edwardboyle/floors/12/ (level 12)
* https://floorplans.library.leeds.ac.uk/edwardboyle/floors/13/ (level 13)

**Health Sciences**

* https://floorplans.library.leeds.ac.uk/healthsciences/floors/

**Laidlaw**

* https://floorplans.library.leeds.ac.uk/laidlaw/floors/ground/ (ground floor)
* https://floorplans.library.leeds.ac.uk/laidlaw/floors/first/ (first floor)
* https://floorplans.library.leeds.ac.uk/laidlaw/floors/second/ (second floor)
* https://floorplans.library.leeds.ac.uk/laidlaw/floors/third/ (third floor)

What is in this repository?
---------------------------

This repository contains a refactored version of the floorplans which adopts the following changes:

* All floors for all libraries are served by a single static web app
* Data for each floor is loaded in the form of an image file (for the floor layout) and GeoJSON data file (for shelves and other points of interest).
* Tools to select floors and highlight shelves are added via a custom Leaflet control