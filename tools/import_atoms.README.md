The script `import_atoms.sh` is a Bash script designed to generate the latest
version of the [WebDriver Automation Atoms](http://code.google.com/p/selenium/wiki/AutomationAtoms)
and store them inside the source code of GhostDriver.

It's a manual update that should be done "regularly" by project maintainers.

## How does it work?

It "injects" a `build.desc` file inside the Selenium repository, to accomodate
the needs of the [CrazyFunBuild](http://code.google.com/p/selenium/wiki/CrazyFunBuild)
rake script used there.

The idea is to maintain all the build needs of GhostDriver within it's
own project, without disrupting Selenium or requesting to add those file there.
At least for now, this is a good approach: if, at any point, more pressing
needs to change Selenium will be required, we will change the approach.

Ivan De Marino
@detronizator / github.com/detro
