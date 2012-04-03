if [[ -z "$1" ]]; then
echo "Must specify a URL for the current Firefox version"
exit 1
fi

ssh ciw@direct.infraware.ca "webapps/missinge/changeFirefoxURL.sh $1"
