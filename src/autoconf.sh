#!/bin/bash
# coding: utf-8

ENVDIR="$(pwd)"
SERVERDIR="$(dirname $ENVDIR)"
SRCDIR="$SERVERDIR/src"
# running server
python "$SRCDIR/manage.py" autoconf $1 8000
