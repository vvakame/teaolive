#!/bin/sh
if type dart > /dev/null 2>&1; then
	dart ./usage_for_ci.dart
else
	echo "dart command is not exists."
	exit 1
fi

