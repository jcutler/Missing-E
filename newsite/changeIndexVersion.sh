#!/bin/bash
sed -e "s/<div version=\"[^\"]*\" id=\"versioncheck\"/<div version=\"$1\" id=\"versioncheck\"/" ~/webapps/missinge/index.html > ~/webapps/missinge/index.new.html
sed -e "s/<span id=\"download_version\">Version [0-9\.]*<\/span>/<span id=\"download_version\">Version $1<\/span>/" ~/webapps/missinge/index.new.html > ~/webapps/missinge/index.html
rm ~/webapps/missinge/index.new.html

echo "var currentVersion=\"$1\";" > ~/webapps/missinge/currentVersion.js