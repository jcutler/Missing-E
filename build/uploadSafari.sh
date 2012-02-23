if [[ "$1" == "-noupload" ]]; then
   exit 0
fi

str=`grep -A 1 CFBundleShortVersionString ../missinge.safariextension/Info.plist | grep string | awk -F '[<>]' '{print $3}'`
num=`grep -A 1 CFBundleVersion ../missinge.safariextension/Info.plist | grep string | awk -F '[<>]' '{print $3}'`

if [[ ! -f "safari-build/missinge.safariextz" ]]; then
   exit 1
else
   scp safari-build/missinge.safariextz ciw@direct.infraware.ca:webapps/missinge/safari/
   ssh ciw@direct.infraware.ca "webapps/missinge/safari/changeVersion.sh $num $str"
fi