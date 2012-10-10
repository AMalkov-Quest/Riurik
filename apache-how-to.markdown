Configuring Riurik with Apache on Ubuntu
=======

### Quick start
Install Apache and mod_wsgi

    sudo apt-get install apache2 libapache2-mod-wsgi

Configure Apache

    sudo vim /etc/apache2/httpd.conf

Content should be

    User ubuntu

    LoadModule deflate_module modules/mod_deflate.so
    
    <VirtualHost *:80>
    
    WSGIScriptAlias / /home/ubuntu/Riurik/riurik.wsgi
    
    AddOutputFilterByType DEFLATE application/javascript text/javascript text/css text/html text/plain
    BrowserMatch ^Mozilla/4 gzip-only-text/html
    BrowserMatch ^Mozilla/4\.0[678] no-gzip
    BrowserMatch \bMSIE !no-gzip !gzip-only-text/html
    #Header append Vary User-Agent env=!dont-vary
    
    ServerAdmin andrey.malkov@gmail.com
    ServerName www.riurik.com
    
    Alias /static/ "/home/ubuntu/Riurik/src/static/"
    
    <Location '/static/'>
        SetHandler None
    </Location>
    
    ErrorLog "/home/ubuntu/Riurik/logs/httpd.log"
    LogLevel error
    DefaultType text/plain
    
    </VirtualHost>

    sudo vim ~/Riurik/riurik.wsgi

Content should be

    import os, sys
    
    os.environ['DJANGO_SETTINGS_MODULE'] = 'settings'
    
    working_dir = os.path.dirname(__file__)
    
    add_path = ['./','./src',]
    
    for p in add_path:
        sys.path.append(os.path.normpath(os.path.join(working_dir, p)))
    
    import django.core.handlers.wsgi
    application = django.core.handlers.wsgi.WSGIHandler()

Add the ubuntu user to the www-data group

    sudo usermod -a -G www-data ubuntu

Restart Apache

    sudo /etc/init.d/apache2 restart
