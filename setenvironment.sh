#!/bin/bash

CWD=`dirname $0`
COMMON="core license identity lib"

for i in $COMMON; do
   if [[ ! -e "$CWD/chrome/$i" ]]; then
      echo "Creating junction for Chrome: $i"
      junction $CWD/chrome/$i $CWD/$i
   fi
   if [[ ! -e "$CWD/missinge.safariextension/$i" ]]; then
      echo "Creating junction for Safari: $i"
      junction $CWD/missinge.safariextension/$i $CWD/$i
   fi
   if [[ ! -e "$CWD/firefox/missinge/data/$i" ]]; then
      echo "Creating junction for Firefox: $i"
      junction $CWD/firefox/missinge/data/$i $CWD/$i
   fi
done

if [[ ! -f "$CWD/firefox/missinge/lib/localizations.js" ]]; then
   echo "Creating hardlink for Firefox localization module"
   fsutil hardlink create $CWD/firefox/missinge/lib/localizations.js $CWD/core/localizations.js
fi

if [[ ! -f "$CWD/firefox/missinge/lib/utils.js" ]]; then
   echo "Creating hardlink for Firefox utilities module"
   fsutil hardlink create $CWD/firefox/missinge/lib/utils.js $CWD/core/utils.js
fi
