#!/bin/bash
# coding: utf-8

# Running WaferSlim websocket server using python and django.

ENVDIR="$(pwd)"
SERVERDIR="$(dirname $ENVDIR)"
SRCDIR="$SERVERDIR/src"
# activating virtual environment
#"$ENVDIR/linux/bin/activate"
# running server
python "$SRCDIR/manage.py" runserver 0.0.0.0:$1 #--multithreaded
#"$ENVDIR/linux/bin/python" "$SRCDIR/manage.py" runserver 0.0.0.0:8000 --multithreaded
