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
mv resources/jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-data resources/data

sed -e '/\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-data":\s*\[/{
N; N;
s/\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-data":\s*\[\s*\n\s*"resources",\s*\n\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-data"/  "jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-data": \[\n   "resources", \n   "data"/
}' harness-options.json > harness-options.new

sed -e 's/resource:\/\/jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-data/resource:\/\/data"/g' harness-options.new > harness-options.json

mv harness-options.new harness-options.json

"$SEVZ" a missinge.zip *

mv missinge.zip $BUILDDIR/missinge.xpi

cd $BUILDDIR

rm -rf missinge

cd $CWD

if [[ "$1" == "-noupload" ]]; then
   exit 0
fi

"c:/Program Files/Mozilla Firefox/firefox.exe" "https://addons.mozilla.org/en-US/developers/addon/missing-e/versions/#version-upload"

