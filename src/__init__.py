# PATCH os.rename for Windows
# On Windows, os.rename function of Python will raise OSError if the destination file already exists.
# Whereas on Unix, it will be removed silently. To fix this problem,
# remove the existing file before renaming if the current operating system is Windows.
# Based on: https://code.djangoproject.com/ticket/9084#no2

import os

if os.name == 'nt':
    from functools import wraps
    def os_rename_patch(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if os.path.exists(args[-1]):
                os.unlink(args[-1])
            return f(*args, **kwargs)
        return wrapper

    os.rename = os_rename_patch(os.rename)