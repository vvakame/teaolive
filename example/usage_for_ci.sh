#!/bin/sh

if not type dart > /dev/null 2>&1; then
	echo "dart command is not exists."
	exit 1
fi

dart usage_for_ci.dart

