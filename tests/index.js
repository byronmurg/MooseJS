#!/usr/bin/env node

const tests = [
	'classes.js',
	'object_members.js',
	'triggers.js',
	'defaults.js',
	'undefined.js',
	'does_it_play_nice.js',
	'interface.js',
	'numbers.js',
	'inheritance.js',
].map((t) => require(`./${t}`));
