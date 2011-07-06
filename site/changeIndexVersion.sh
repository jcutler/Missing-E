#!/bin/bash
sed -e "s/<div version=\"[^\"]*\" id=\"versioncheck\">/<div version=\"$1\" id=\"versioncheck\">/" ~/webapps/missinge/index.html > ~/webapps/missinge/index.new.html
sed -e "s/Update to v[0-9\.]* now/Update to v$1 now/" ~/webapps/missinge/index.new.html > ~/webapps/missinge/index.html
rm ~/webapps/missinge/index.new.html
