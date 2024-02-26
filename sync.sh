#!/bin/bash
# Uses rsync to update floorplans from Deployment directory
/usr/bin/rsync -lcrvt  /var/www/Systems/private/Deployment/floorplans.library.leeds.ac.uk/public/ /var/www/floorplans/public
