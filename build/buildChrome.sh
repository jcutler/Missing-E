ZIP=`which zip`
UNZIP=`which unzip`
SEVZ="c:/Program Files/7-Zip/7z.exe"

rm -rf chrome
cp -R ../chrome .
find chrome -name ".*.swp" -exec rm {} \;
mv chrome MissingE
if [[ -d "chrome-build" ]]; then
   rm -rf chrome-build/missinge.zip
else
   mkdir chrome-build
fi

if [[ -n "$ZIP" ]]; then
   cd MissingE
   $ZIP -r9 ../chrome-build/missinge.zip *
   cd ..
else
   "$SEVZ" a -mx9 chrome-build/missinge.zip MissingE
fi

rm -rf MissingE

if [[ "$1" == "-noupload" ]]; then
   exit 0
fi

SYS=`uname`

if [[ "$SYS" == "Darwin" ]]; then
   open -a "Google Chrome" "https://chrome.google.com/webstore/developer/edit/bcjbagclppcgdbpobcpoojdjdmcjhpid?hl=en-US"
else
   "c:/Documents and Settings/Administrator/Local Settings/Application Data/Google/Chrome/Application/chrome.exe" "https://chrome.google.com/webstore/developer/edit/bcjbagclppcgdbpobcpoojdjdmcjhpid?hl=en-US"
fi