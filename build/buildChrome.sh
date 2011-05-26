rm -rf chrome
cp -R ../chrome .
find chrome -name ".*.swp" -exec rm {} \;
mv chrome MissingE
if [[ -d "chrome-build" ]]; then
   rm -rf chrome-build/missinge.zip
else
   mkdir chrome-build
fi

"c:/Program Files/7-Zip/7z.exe" a chrome-build/missinge.zip MissingE
rm -rf MissingE

if [[ "$1" == "-noupload" ]]; then
   exit 0
fi

"c:/Documents and Settings/Administrator/Local Settings/Application Data/Google/Chrome/Application/chrome.exe" "https://chrome.google.com/webstore/developer/edit/bcjbagclppcgdbpobcpoojdjdmcjhpid?hl=en-US"
