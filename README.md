# RoundHouse - A Javascript Framework using knockout.js #

NOTE: This framework is evolving live.  It is not ready for third party use yet.

## Why build a framework on top of knockout.js? ##

In the course of building a fairly complex application with knockout.js ([Folderus](https://www.folderus.com/)) I found that once you cross a certain threshold of complexity a single view model knockout.js application becomes unweildy.  

I'm building this framework to standardize the following elements:

- hiding/showing page elements based on window.location.hash contents
- enabling multiple view model binding in a single html file
- providing object encapsulation using the module pattern with a well defined api interface between modules

## External Dependencies ##

- knockout.js 1.3 beta
- jQuery 1.6.3
- jQuery templates
- ba-hashchange

## Examples ##

- Flicker Explorer: a Flickr search app that defines a search view, a list view and a thumb view