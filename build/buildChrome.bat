@echo off

cp -R ../chrome .
rename chrome MissingE
mkdir chrome
rm chrome/missinge.zip
"C:\Program Files\7-Zip\7z.exe" a chrome\missinge.zip MissingE
rm -rf MissingE
