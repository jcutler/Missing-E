#!/bin/bash

CWD=`dirname $0`

if [[ ! -e "$CWD/chrome/core" ]]; then
   echo "Creating junction for Chrome: core"
   junction $CWD/chrome/core $CWD/core
fi
if [[ ! -e "$CWD/chrome/license" ]]; then
   echo "Creating junction for Chrome: license"
   junction $CWD/chrome/license $CWD/license
fi
if [[ ! -e "$CWD/missinge.safariextension/core" ]]; then
   echo "Creating junction for Safari: core"
   junction $CWD/missinge.safariextension/core $CWD/core
fi
if [[ ! -e "$CWD/missinge.safariextension/license" ]]; then
   echo "Creating junction for Safari: license"
   junction $CWD/missinge.safariextension/license $CWD/license
fi
if [[ ! -e "$CWD/firefox/missinge/data/core" ]]; then
   echo "Creating junction for Firefox: core"
   junction $CWD/firefox/missinge/data/core $CWD/core
fi
if [[ ! -e "$CWD/firefox/missinge/data/license" ]]; then
   echo "Creating junction for Firefox: license"
   junction $CWD/firefox/missinge/data/license $CWD/license
fi
