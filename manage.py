import os, sys
#for pyinstaller
import src.plugins.search
import src.plugins.git
import src.plugins.github

from django.db.backends.dummy import base
from django.core.cache.backends.locmem import LocMemCache
from django.contrib.sessions import middleware, serializers

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "src.settings")

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)