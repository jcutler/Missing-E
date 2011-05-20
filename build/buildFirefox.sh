CWD=$PWD
BUILDDIR=$PWD/firefox-build
JETPACK=`find /d -maxdepth 1 -name "addon-sdk*" -type d`
FF="d:/Missing-E/firefox/missinge"
rm -rf $BUILDDIR/*

cd $JETPACK

source bin/activate

cd $FF

cfx xpi

mv missinge.xpi $BUILDDIR

#Do editing of harness options to avoid file length issue

"c:/Program Files/Mozilla Firefox/firefox.exe" "https://addons.mozilla.org/en-US/developers/addon/missing-e/versions/#version-upload"

cd $CWD
