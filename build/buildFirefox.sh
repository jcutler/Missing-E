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
mv resources/jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-lib resources/lib
mv resources/jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-tests resources/tests
mv resources/jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-addon-kit-data resources/addon-kit-data
mv resources/jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-addon-kit-lib resources/addon-kit-lib
mv resources/jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-api-utils-data resources/api-utils-data
mv resources/jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-api-utils-lib resources/api-utils-lib

sed -e '/\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-data":\s*\[/{
N; N;
s/\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-data":\s*\[\s*\n\s*"resources",\s*\n\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-data"/  "jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-data": \[\n   "resources", \n   "data"/
}' harness-options.json > harness-options.new.0

sed -e '/\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-lib":\s*\[/{
N; N;
s/\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-lib":\s*\[\s*\n\s*"resources",\s*\n\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-lib"/  "jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-lib": \[\n   "resources", \n   "lib"/
}' harness-options.new.0 > harness-options.new.1

sed -e '/\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-tests":\s*\[/{
N; N;
s/\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-tests":\s*\[\s*\n\s*"resources",\s*\n\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-tests"/  "jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-missinge-tests": \[\n   "resources", \n   "tests"/
}' harness-options.new.1 > harness-options.new.2

sed -e '/\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-addon-kit-data":\s*\[/{
N; N;
s/\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-addon-kit-data":\s*\[\s*\n\s*"resources",\s*\n\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-addon-kit-data"/  "jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-addon-kit-data": \[\n   "resources", \n   "addon-kit-data"/
}' harness-options.new.2 > harness-options.new.3

sed -e '/\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-addon-kit-lib":\s*\[/{
N; N;
s/\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-addon-kit-lib":\s*\[\s*\n\s*"resources",\s*\n\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-addon-kit-lib"/  "jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-addon-kit-lib": \[\n   "resources", \n   "addon-kit-lib"/
}' harness-options.new.3 > harness-options.new.4

sed -e '/\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-api-utils-data":\s*\[/{
N; N;
s/\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-api-utils-data":\s*\[\s*\n\s*"resources",\s*\n\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-api-utils-data"/  "jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-api-utils-data": \[\n   "resources", \n   "api-utils-data"/
}' harness-options.new.4 > harness-options.new.5

sed -e '/\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-api-utils-lib":\s*\[/{
N; N;
s/\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-api-utils-lib":\s*\[\s*\n\s*"resources",\s*\n\s*"jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-api-utils-lib"/  "jid0-0pgffacvvhubiefykrvvc5w6liu-at-jetpack-api-utils-lib": \[\n   "resources", \n   "api-utils-lib"/
}' harness-options.new.5 > harness-options.new.6

mv harness-options.new.6 harness-options.json
rm -f harness-options.new.*

sed -e 's/<em:maxVersion>[^<]*/<em:maxVersion>11.0a1/' install.rdf > install.new.0
sed -e 's/<em:minVersion>[^<]*/<em:minVersion>7.0/' install.new.0 > install.new.1

mv install.new.1 install.rdf
rm -f install.new.*

"$SEVZ" a missinge.zip *

mv missinge.zip $BUILDDIR/missinge.xpi

cd $BUILDDIR

rm -rf missinge

cd $CWD

if [[ "$1" == "-noupload" ]]; then
   exit 0
fi

"c:/Program Files/Mozilla Firefox/firefox.exe" "https://addons.mozilla.org/en-US/developers/addon/missing-e/versions/#version-upload"

