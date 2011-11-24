#!/bin/bash

CWD=`dirname $0`
COMMON="core license"

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
