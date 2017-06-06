from setuptools import setup, find_packages


with open("VERSION") as version_file:
    VERSION = version_file.read().strip()


setup(
    name="svGhostDriver",
    packages=find_packages(),
    version=VERSION,
    include_package_data=True,
    author="Scivisum",
    author_email="ghostdriver@scivisum.co.uk",
    description="Python package containing custom GhostDriver",
    url="https://github.com/scivisum/ghostdriver"
)
