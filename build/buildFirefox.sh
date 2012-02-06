CWD=${PWD/#d:/\/d}
cd $CWD
BUILDDIR=$PWD/firefox-build
JETPACK=`find ../../ -maxdepth 1 -name "addon-sdk*" -type d`
FF=$PWD/../firefox/missinge
ZIP=`which zip`
UNZIP=`which unzip`
SEVZ="c:/Program Files/7-Zip/7z.exe"
rm -rf $BUILDDIR/*

cd $JETPACK

source bin/activate

cd $FF

cfx xpi

mkdir $BUILDDIR/missinge

mv missinge.xpi $BUILDDIR/missinge/missinge.zip

cd $BUILDDIR/missinge

if [[ -n "$UNZIP" ]]; then
   $UNZIP missinge.zip
else
   "$SEVZ" x missinge.zip
fi

rm missinge.zip
#mv resources/jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-data resources/data
#mv resources/jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-lib resources/lib
#mv resources/jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-tests resources/tests
#mv resources/jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-addon-kit-data resources/addon-kit-data
#mv resources/jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-addon-kit-lib resources/addon-kit-lib
#mv resources/jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-api-utils-data resources/api-utils-data
#mv resources/jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-api-utils-lib resources/api-utils-lib

#sed -E -e '/[ ]*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-data":[ ]*\[/{
#N; N;
#s/([ ]*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-data":[ ]*\[[ ]*\n[ ]*"resources",[ ]*\n[ ]*)"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-data"/\1"data"/
#}' harness-options.json > harness-options.new.0

#sed -E -e '/[ ]*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-lib":[ ]*\[/{
#N; N;
#s/([ ]*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-lib":[ ]*\[[ ]*\n[ ]*"resources",[ ]*\n[ ]*)"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-lib"/\1"lib"/
#}' harness-options.new.0 > harness-options.new.1

#sed -E -e '/[ ]*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-tests":[ ]*\[/{
#N; N;
#s/([ ]*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-tests":[ ]*\[[ ]*\n[ ]*"resources",[ ]*\n[ ]*)"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-tests"/\1"tests"/
#}' harness-options.new.1 > harness-options.new.2

#sed -E -e '/[ ]*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-addon-kit-data":[ ]*\[/{
#N; N;
#s/([ ]*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-addon-kit-data":[ ]*\[[ ]*\n[ ]*"resources",[ ]*\n[ ]*)"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-addon-kit-data"/\1"addon-kit-data"/
#}' harness-options.new.2 > harness-options.new.3

#sed -E -e '/[ ]*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-addon-kit-lib":[ ]*\[/{
#N; N;
#s/([ ]*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-addon-kit-lib":[ ]*\[[ ]*\n[ ]*"resources",[ ]*\n[ ]*)"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-addon-kit-lib"/\1"addon-kit-lib"/
#}' harness-options.new.3 > harness-options.new.4

#sed -E -e '/[ ]*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-api-utils-data":[ ]*\[/{
#N; N;
#s/([ ]*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-api-utils-data":[ ]*\[[ ]*\n[ ]*"resources",[ ]*\n[ ]*)"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-api-utils-data"/\1"api-utils-data"/
#}' harness-options.new.4 > harness-options.new.5

#sed -E -e '/[ ]*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-api-utils-lib":[ ]*\[/{
#N; N;
#s/([ ]*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-api-utils-lib":[ ]*\[[ ]*\n[ ]*"resources",[ ]*\n[ ]*)"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-api-utils-lib"/\1"api-utils-lib"/
#}' harness-options.new.5 > harness-options.new.6

#mv harness-options.new.6 harness-options.json
#rm -f harness-options.new.*

sed -E -e 's/<em:maxVersion>[^<]*/<em:maxVersion>13.0a1/' install.rdf > install.new.0
sed -E -e 's/<em:minVersion>[^<]*/<em:minVersion>7.0/' install.new.0 > install.new.1

mv install.new.1 install.rdf
rm -f install.new.*

if [[ -n "$ZIP" ]]; then
   $ZIP -r missinge.zip *
else
   "$SEVZ" a missinge.zip *
fi

mv missinge.zip $BUILDDIR/missinge.xpi

cd $BUILDDIR

rm -rf missinge

cd $CWD

if [[ "$1" == "-noupload" ]]; then
   exit 0
fi

SYS=`uname`

if [[ "$SYS" == "Darwin" ]]; then
   open -a Firefox "https://addons.mozilla.org/en-US/developers/addon/missing-e/versions/#version-upload"
else
   "c:/Program Files/Mozilla Firefox/firefox.exe" "https://addons.mozilla.org/en-US/developers/addon/missing-e/versions/#version-upload" &
fi
