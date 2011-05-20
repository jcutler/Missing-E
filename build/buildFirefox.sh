CWD=$PWD
BUILDDIR=$PWD/firefox-build
JETPACK=`find /d -maxdepth 1 -name "addon-sdk*" -type d`
FF="d:/Missing-E/firefox/missinge"
SEVZ="c:/Program Files/7-Zip/7z.exe"
rm -rf $BUILDDIR/*

cd $JETPACK

source bin/activate

cd $FF

cfx xpi

mkdir $BUILDDIR/missinge

mv missinge.xpi $BUILDDIR/missinge/missinge.zip

cd $BUILDDIR/missinge

"$SEVZ" x missinge.zip

rm missinge.zip

mv resources/jid0-0pgffacvvhubiefykrvvc5w6liu-missinge-data resources/data

sed -e '/\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-missinge-data":\s*\[/{
N; N;
s/\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-missinge-data":\s*\[\s*\n\s*"resources",\s*\n\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-missinge-data"/  "jid0-0pgffacvvhubiefykrvvc5w6liu-missinge-data": \[\n   "resources", \n   "data"/
}' harness-options.json > harness-options.new

mv harness-options.new harness-options.json

"$SEVZ" a missinge.zip *

mv missinge.zip $BUILDDIR/missinge.xpi

cd $BUILDDIR

rm -rf missinge

#"c:/Program Files/Mozilla Firefox/firefox.exe" "https://addons.mozilla.org/en-US/developers/addon/missing-e/versions/#version-upload"

cd $CWD
