#!/bin/sh

# A word about this shell script:
#
# the pip package should be installed previously
sudo apt-get install -y python-pip

# install Django
sudo pip install Django

# install nodejs
sudo apt-get install -y python-software-properties
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install -y nodejs npm

# install CoffeeScript
sudo npm install -g coffee-script

# checkout production code
git clone git@github.com:andrew-malkov/SASP.git SASPHunter
cd SASPHunter
git checkout $BRANCH

cd ..
 
# install Riurik
git clone git@github.com:andrew-malkov/Riurik.git
cd Riurik
git checkout quick_tests_support
sh autoconf.sh info-portal-tests SASPHunter


