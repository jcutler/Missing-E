@echo off

cp -R ../chrome .
cd chrome
del /S .*.swp
cd ..
rename chrome MissingE
mkdir chrome-build
rm chrome-build/missinge.zip
"C:\Program Files\7-Zip\7z.exe" a chrome-build\missinge.zip MissingE
rm -rf MissingE
