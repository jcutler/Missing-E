The `lib` directory contains all of the included library code for use as content scripts, stylesheets and other resources. It is common to all platform versions of **Missing e**.

When building, this directory should be linked into the various extensions:

* `chrome/lib` -> `lib`
* `firefox/missinge/data/lib` -> `lib`
* `missinge.safariextension/lib` -> `lib`
