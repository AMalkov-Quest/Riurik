import os, sys
#for pyinstaller
from src import urls
import src.plugins.search
from src.plugins.search import urls
from src.plugins.help import urls
import src.plugins.git
from src.plugins.git import urls
import src.plugins.github
from src.plugins.github import urls
from src.templatetags import dir_index_tags

from django.core import context_processors
from django.contrib.messages import context_processors
from django.db.backends.dummy import base
from django.core.cache.backends.locmem import LocMemCache
from django.contrib.sessions import middleware, serializers

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "src.settings")

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)