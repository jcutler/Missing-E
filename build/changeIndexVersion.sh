ver=`grep "\"version\":" ../chrome/manifest.json | awk -F '"' '{print $4}'`

if [[ -n "$1" ]]; then
ver=$1;
fi

ssh ciw@infraware.ca "webapps/missinge/changeIndexVersion.sh $ver"

