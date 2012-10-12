#!/bin/sh
exec ssh -i "$GIT_IDENTITY_FILE" -o "StrictHostKeyChecking no" "$@"
