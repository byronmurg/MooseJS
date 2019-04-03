#!/usr/bin/env node
'use strict';

const MooseJS = require('../Moose.js');
const Test = require('./testLib.js');

Test.section("Enum test", (test) => {

	const Flavour = MooseJS.defineEnum([ "chocolate", "strawberry", "vanilla" ])

	test.check_exception(
		"Incorrect value throws an exception",
		'Invalid input "Goo" for enum',
		() => new Flavour("Goo")
	);

	test.check_safe("Correct value does not throw an exception", () => new Flavour("chocolate"));

});
