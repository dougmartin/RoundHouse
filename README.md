# RoundHouse - A Javascript Framework using knockout.js #

NOTE: This framework is evolving live.  It is not ready for third party use yet.

## Why build a framework on top of knockout.js ##

In the course of building a fairly complex application with knockout.js ([Folderus](https://www.folderus.com/)) I found that once you cross a certain threshold of complexity a single view model knockout.js application becomes unweildy.  I'm building this framework to remove the following elements out of the application so I can concentrate on the core features:

- window.location.hash routing
- multiple view model binding in a single html file
- remote observable and observable array updates

## External Dependencies ##

knockout.js 1.3 beta
jQuery 1.6.3
jQuery templates
ba-hashchange

