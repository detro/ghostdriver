The script `export_ghostdriver.sh` is a Bash script designed to export GhostDriver sources
into your local PhantomJS source.

It's a manual update that should be done "regularly" by project maintainers.

## How does it work?

It first deletes `PHANTOMJS_SOURCE/src/ghostdriver` directory, than creates it again
and copies GhostDriver's source over.

After that, it generates the `PHANTOMJS_SOURCE/src/ghostdriver/ghostdriver.qrc` XML
file, so that GhostDriver source code can be included in PhantomJS as Qt Resource Files.

Ivan De Marino
@detronizator / github.com/detro
