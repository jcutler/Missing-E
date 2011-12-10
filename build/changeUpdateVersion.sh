ver=`grep "\"version\":" ../chrome/manifest.json | awk -F '"' '{print $4}'`

if [[ -n "$1" ]]; then
ver=$1;
fi

ssh ciw@direct.infraware.ca "webapps/missinge/changeUpdateVersion.sh $ver"

