#!/bin/sh

# A word about this shell script:
#
# the pip package should be installed previously
apt-get install python-pip

# install Django
pip install Django

# install nodejs
apt-get install python-software-properties
add-apt-repository ppa:chris-lea/node.js
apt-get update
apt-get install nodejs npm

# install CoffeeScript
npm install -g coffee-script
 
# install Riurik
git clone git@github.com:andrew-malkov/Riurik.git
cd ~/Riurik/src
git checkout quick_tests_support
#sh autoconf.sh hunterbranch1 ~/SASPHunter


