#!/usr/bin/env node
'use strict';

const MooseJS = require('../Moose.js')
const Test = require('./testLib.js');

Test.section("Casting invalid values as Dates", (test) => {

	class Appointment extends MooseJS.defineClass({
		final: true,
		has: {
			startTime: { is:"rw", isa:Date, required:true },
		}
	}){}

	test.check_exception("Bad date string should throw exception", "String cannot be converted to a date", () => new Appointment({ startTime:"bad date" }))
})
