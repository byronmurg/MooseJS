#!/usr/bin/env node
'use strict';

const MooseJS = require('../Moose.js')
const Test = require('./testLib.js');

const Project = MooseJS.defineClass({
	name: "project",
	final: true,
	has: {
		name: String,
		lines: Number,
		versions: [String],
	},
})

Test.section("Shorthand is valid", (test) => {

	test.check_safe("No errors thrown", () => {
		const moose = new Project({
			name: "moosejs",
			lines: 99999999,
			versions: ["1.0", "1.2"],
		})		

		test.check_true("Property has been set correctly", () => moose.lines == 99999999)

		test.check_true("Property is read-only", () => Project.__class_properties.name.is == "ro")
		test.check_true("Property is required", () => Project.__class_properties.name.required)
	})
})

