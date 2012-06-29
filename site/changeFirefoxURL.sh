#!/bin/bash

echo "var firefoxURL=\"$1\";" > ~/webapps/missinge/firefoxURL.js
echo "<?php" > ~/webapps/missinge/firefoxURL.php
echo "\$firefoxURL=\"$1\";" >> ~/webapps/missinge/firefoxURL.php
echo "?>" >> ~/webapps/missinge/firefoxURL.php