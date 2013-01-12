# Versioning GhostDriver

Currently versioning in GhostDriver is managed by hand.

The components that have a version are the Driver itself and the Binding.
Those have independent version numbers, but when both receive a version-bump,
it's a good idea to bring the Binding (rarely modified) to the same version
as the Driver (more frequently modified).

This "model" can help to reduce the version confusion for who is less aware
of the details of this software's architecture.

To update the version, please modify the following files:

* `VERSION`
* `binding/java/build.gradle`
* `src/main.js`
