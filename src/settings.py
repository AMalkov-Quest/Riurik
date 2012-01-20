#######################################################################################
#Copyright (C) 2008 Quest Software, Inc.
#File:		settings.py
#Version:       1.0.0.0

#######################################################################################
#
#       THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND,
#       EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED
#       WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE.
#
########################################################################################
# Django settings for web_reports project.
import os, sys

working_dir = os.path.dirname(os.path.abspath(__file__))
root = os.path.normpath(os.path.dirname(working_dir))

from oldsettings import *
from virtual_paths import *

DEBUG = True
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    # ('Your Name', 'your_email@domain.com'),
)

MANAGERS = ADMINS

DATABASE_ENGINE = 'sqlite3'           # 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
DATABASE_NAME = os.path.dirname( __file__ ) + 'local.db'             # Or path to database file if using sqlite3.
DATABASE_USER = ''             # Not used with sqlite3.
DATABASE_PASSWORD = ''         # Not used with sqlite3.
DATABASE_HOST = ''             # Set to empty string for localhost. Not used with sqlite3.
DATABASE_PORT = ''             # Set to empty string for default. Not used with sqlite3.
DATABASE_OPTIONS = {'timeout': 30}

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'Europe/Moscow'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# Absolute path to the directory that holds media.
# Example: "/home/media/media.lawrence.com/"
MEDIA_ROOT = os.path.dirname( __file__ ) + '/static'

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash if there is a path component (optional in other cases).
# Examples: "http://media.lawrence.com", "http://example.com/media/"
MEDIA_URL = '/static/'

# URL prefix for admin media -- CSS, JavaScript and images. Make sure to use a
# trailing slash.
# Examples: "http://foo.com/media/", "/media/".
ADMIN_MEDIA_PREFIX = '/media/'

# Make this unique, and don't share it with anybody.
SECRET_KEY = '(nf!nzz3a&uxzbdb)9*hor38)*a4&m)szzbn$&8wy*&h7t*v_-'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.load_template_source',
    'django.template.loaders.app_directories.load_template_source',
#     'django.template.loaders.eggs.load_template_source',
)
#SESSION_ENGINE = 'django.contrib.sessions.backends.file'
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
CACHE_BACKEND = 'locmem://'
CACHE_MIDDLEWARE_ANONYMOUS_ONLY = False
CACHE_MIDDLEWARE_SECONDS = 600

MIDDLEWARE_CLASSES = (
	'django.contrib.sessions.middleware.SessionMiddleware',
)

ROOT_URLCONF = 'urls'

TEMPLATE_DIRS = (

    os.path.join(os.path.dirname( __file__ ), 'templates'),
)

TEMPLATE_CONTEXT_PROCESSORS = (
	"django.core.context_processors.i18n",
	"django.core.context_processors.media",
	"django.core.context_processors.request",
	"django.contrib.messages.context_processors.messages",
)

INSTALLED_APPS = (
	'django.contrib.auth',
    'django.contrib.contenttypes',
	'django.contrib.sessions',
	'django.contrib.sites',
	'django.contrib.messages',
	'src',
	'src.plugins.search',
)

EXEC_TESTS_CMD='static/tests/riurik.html'
UPLOAD_TESTS_CMD='testsrc/upload'

TEST_CONTEXT_FILE_NAME = '.context.ini'
TEST_CONTEXT_JS_FILE_NAME = '.context.js'
TEST_FILE_EXT = '.js'
TEST_SWAP_FILE_NAME = '.%s.swp'
LIB_KEY_NAME = 'libraries'
LIB_DEFAULT_NAME = 'library.js'
APPEND_SLASH = False
CODEMIRROR_CALL_EDITOR_FOR = '^.*\.(?:js|ini|html|py)$'
INCLUDE_KEY = 'include'
EXCLUDE_KEY = 'exclude'

#try:
#	from local_settings import *
#except Exception, ex: print ex
#pass
