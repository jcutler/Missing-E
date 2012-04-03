#!/bin/bash

DIR=`dirname $0`

if [[ "$#" -ne "2" ]]; then
   exit 1
fi

sed -e "s/%SHORT_VERSION%/$1/" $DIR/missinge-version.plist.template > $DIR/missinge-version.plist.tmp
sed -e "s/%LONG_VERSION%/$2/" $DIR/missinge-version.plist.tmp > $DIR/missinge-version.plist
rm $DIR/missinge-version.plist.tmp
