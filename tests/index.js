#!/usr/bin/env node

const tests = [
	'classes.js',
	'appointment_test.js',
	'object_members.js',
	'undefined.js',
	'does_it_play_nice.js',
	'interface.js',
	'numbers.js',
].map((t) => require(`./${t}`));

