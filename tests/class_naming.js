#!/usr/bin/env node
'use strict';

const MooseJS = require('../Moose.js');
const Test = require('./testLib.js');

Test.section("Basic class naming", (test) => {

	let o = {}

	o.bunny = class extends MooseJS.defineClass({
		name: "Bunny",
		has: {
			teeth: { is:"ro", isa:String },
		}
	})
	{};

	const mable = new o.bunny();

	test.check_exception("Exception throws correct class name", "Property \"teeth\" of \"Bunny\" is read only", () => mable.teeth = 'huge');

	class SuperBunny extends MooseJS.defineClass({
		final: true,
		extends: o.bunny
	})
	{};

	const superMable = new SuperBunny()

	test.check_exception("Child class exception throws correct class name", "Property \"teeth\" of \"SuperBunny\" is read only", () => superMable.teeth = 'huge');
});
