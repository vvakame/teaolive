#!/bin/sh

if not type prove > /dev/null 2>&1; then
	echo "prove command is not exists."
        exit 1
fi

if not type dart > /dev/null 2>&1; then
	echo "dart command is not exists."
	exit 1
fi

# memo. sudo cpan TAP::Harness::JUnit
prove --harness TAP::Harness::JUnit usage_for_ci.sh

