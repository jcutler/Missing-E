![](https://github.com/jcutler/Missing-E/raw/master/resources/logo/missinge48.png)
##Missing e: {browser extension/add-on for Tumblr!}

**Missing e** is a set of tools, features and interface changes for [Tumblr](http://www.tumblr.com). What started out as a bunch of userscripts has been incorporated into a full-fledged browser extension for _Chrome_, _Firefox_ and _Safari_!

**[GET IT](http://missinge.infraware.ca) - [FEATURES](http://missinge.infraware.ca/features) - [FAQ](http://missinge.infraware.ca/faq) - [TUMBLR](http://blog.missinge.infraware.ca) - [TWITTER](http://twitter.com/theMissinge)**

***

Jeremy Cutler ([cutlerish.tumblr.com](cutlerish.tumblr.com))  
Released under the [GPL Version 3 (or later) License](http://www.gnu.org/licenses/gpl.html)

[**Missing e** Change History](http://github.missinge.infraware.ca/changes)

_By downloading and using this extension, you agree to the terms and conditions set forth in the [**Missing e End User License Agreement**](http://missinge.infraware.ca/EULA.txt)_

If you enjoy this extension, please consider [donating](http://www.pledgie.com/campaigns/14406) to support future development.  
<a href="http://www.pledgie.com/campaigns/14406">![](http://missinge.infraware.ca/images/pledgie.png)</a>

***

###Note for Developers

The Firefox version of **Missing e** is built using the command-line [Mozilla Add-On SDK](https://addons.mozilla.org/en-US/developers/builder), which can be obtained [here](https://addons.mozilla.org/en-US/developers/builder).

The **Missing e** code has been reorganized as of version 2.3.0 so that most of the extension is platform-agnostic.

As such, I have included a [`setenvironment.sh`](https://github.com/jcutler/Missing-E/blob/master/setenvironment.sh) script that sets up Windows junctions and hard links so that shared folders and files can be added to all platform builds. This script was written for MINGW32 on a system with the Microsoft [`junction`](http://technet.microsoft.com/en-us/sysinternals/bb896768) utility (which you can [get here](http://technet.microsoft.com/en-us/sysinternals/bb896768)). On a *nix/OSX filesystem, you can simply replace all the `junction` and `fsutil hardlink` commands with `ln -s` to create symbolic links.
