#!/usr/bin/env node

const tests = [
	'classes',
	'object_members',
	'triggers',
	'defaults',
	'undefined',
	'does_it_play_nice',
	'interface',
	'numbers',
	'inheritance',
	'class_naming',
	'dates',
	'typed_array',
	'typed_map',
	'enums',
	'buffers',
	'serialize',
	'short_hand',
	'methods',
	'array_limits',
].map((t) => {
	console.log(`[[[ ----- ${t} ----- ]]]`)
	require(`./${t}.js`)
});
