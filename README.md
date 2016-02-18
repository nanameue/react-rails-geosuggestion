# react-rails-geosuggestion
Google Place suggestion React component for rails.

This is a modified version of [react-geosuggest](https://github.com/ubilabs/react-geosuggest) to make it fit to the project in Nanameue. Basically, these are the changes:

* Rewritten in vanilla js.
* Fix some bugs.
* Make it compatible with react-rails pattern.
* Remove some pass-through props that seems unnecessary.

Please kindly refer to the sample on [the original live demo](http://ubilabs.github.io/react-geosuggest/)

Thank @ubilabs for a nice start on this lib.

PS. The component were rewritten to match our own coding style and environment. It may not work instantly once you grab it, you may need to adjust some files as well. :)

## Installation
For Rails project, just place these files in javascript folder (either in app/assets or vendor). Then, update your application.js to include all the components.
Also for the stylesheet, just simple place them in the stylesheet folder and added them to the manifest file.
