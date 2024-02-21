#!/bin/bash
# Uses rsync to update from a Deployment directory

BFILE=`basename $0`

declare -A projects
projects[imu-explore]="explore"
projects[ingestion-maintenance]="explore/private/Scripts"
projects[floorplans]="floorplans.library.leeds.ac.uk/public->floorplans/public"

LULDEPLOYDIR=/var/www/Systems/private/Deployment/
LULWEBAPPSROOT=/var/www/

function usage {
    echo $BFILE is used to synchronise files from git repositories with the live library website
    echo 1. Repositories must be cloned/updated in the Deployment directory first
    echo 2. Then "$BFILE <project>"
    exit 1
}

# Project
if [ $# -lt 1 ]
  then
    echo
    echo "*** ERROR - YOU MUST SUPPLY A PROJECT ***"
    usage
fi

project=none
folders=none

for p in "${!projects[@]}"; do
    if [ $p == "$1" ]; then
        folders=${projects[$1]}
        project=$p
        break
    fi
done

if [ "$project" == 'none' ]; then
    echo
    echo "*** ERROR - INVALID PROJECT $1 ***"
    usage
fi
SOURCEDIR="$LULDEPLOYDIR/$project"
TARGETDIR="$LULWEBAPPSROOT/$depRoot"
OIFS=$IFS
IFS='->'
fldrs=($folders)
echo ${fldrs[0]}
echo ${fldrs[1]}
IFS=$OIFS
exit 1

# Do the rsync

action=noop
if [ $# -eq 2 ]
    then
    action=$2
fi
echo About to rsync files from ${LULDEPLOYDIR}/$project to ${TARGETDIR}
if [ "$action" == "sync" ]; then
    echo
    echo Type YES to proceed
    read ok
    if [ $ok == 'YES' ]; then
        /usr/bin/rsync -lcrvt --exclude '.settings' --exclude '.buildpath'  --exclude '.project' --exclude '.git*' --exclude 'README.md' --exclude '_*' ${LULDEPLOYDIR}/$project/ $TARGETDIR
    fi
else
    echo "**********************************"
    echo "*** DRY RUN - NO FILES UPDATED ***"
    echo "**********************************"
    echo

    /usr/bin/rsync --dry-run -lcrv  --exclude '.settings' --exclude '.buildpath' --exclude '.project' --exclude '.git*' --exclude 'README.md' --exclude '_*' ${LULDEPLOYDIR}/$project/ $TARGETDIR

    echo
    echo "**********************************"
    echo "*** DRY RUN - NO FILES UPDATED ***"
    echo "**********************************"
fi

