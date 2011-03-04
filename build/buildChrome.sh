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

