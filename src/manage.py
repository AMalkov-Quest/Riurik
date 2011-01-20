#######################################################################################
#Copyright (C) 2008 Quest Software, Inc.
#File:		manage.py
#Version:       1.0.0.0

#######################################################################################
#
#       THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND,
#       EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED
#       WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE.
#
########################################################################################
import os, sys
current_dir = os.path.dirname(os.path.abspath(__file__))
product_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.insert(0, current_dir)
sys.path.insert(1, os.path.join(product_root, 'tests'))
sys.path.insert(2, os.path.join(product_root, 'tests', 'contrib'))
sys.path.insert(3, os.path.join(product_root, 'SharePoint Information Portal'))
sys.path.insert(4, os.path.join(product_root, 'SharePoint Information Portal', 'Application'))

from django.core.management import execute_manager

try:
    import settings # Assumed to be in the same directory.
except ImportError:
    sys.stderr.write("Error: Can't find the file 'settings.py' in the directory containing %r. It appears you've customized things.\nYou'll have to run django-admin.py, passing it your settings module.\n(If the file settings.py does indeed exist, it's causing an ImportError somehow.)\n" % __file__)
    sys.exit(1)

if __name__ == "__main__":
    execute_manager(settings)
