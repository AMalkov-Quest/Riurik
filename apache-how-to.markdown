Configuring Riurik with Apache on Ubuntu
=======

### Quick start
Install Apache and mod_wsgi

    sudo apt-get install apache2 libapache2-mod-wsgi

Configure Apache

    sudo vim /etc/apache2/httpd.conf
    sudo vim ~/Riurik/riurik.wsgi

Restart Apache

    sudo /etc/init.d/apache2 restart
