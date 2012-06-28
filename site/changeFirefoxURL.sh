#!/bin/bash

echo "<?php" > ~/webapps/missinge/firefoxURL.php
echo "\$firefoxURL=\"$1\";" >> ~/webapps/missinge/firefoxURL.php
echo "?>" >> ~/webapps/missinge/firefoxURL.php