#!/bin/bash
# coding: utf-8

ENVDIR="$(pwd)"
SERVERDIR="$(dirname $ENVDIR)"
SRCDIR="$SERVERDIR/src"
# running server
# python "$SRCDIR/manage.py" runserver 0.0.0.0:$1
python "$SRCDIR/manage.py" runserver 0.0.0.0:80 #--multithreaded
