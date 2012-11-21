#!/bin/bash
sudo pip install ropemode

sudo apt-get install python-setuptools tmux
sudo easy_install django pygithub

sudo pip install minimock
sudo pip install tl.testing
sudo pip install PyGithub
sudo pip install markdown

#git
sudo apt-get install git
git config --global user.name
git congig --global user.email

sudo apt-get install coffeescript

#cucumber-js
sudo apt-get install nodejs
#or
sudo apt-get install build-essential
curl -O http://nodejs.org/dist/v0.8.14/node-v0.8.14.tar.gz
tar xzvf node-v0.8.14.tar.gz
cd node-v0.8.14
sudo ./configure
sudo make
sudo make install

sudo apt-get install npm
sudo npm install cucumber
cd node_modules/cucumber
sudo npm link
