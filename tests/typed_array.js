#!/usr/bin/env node
'use strict';

const MooseJS = require('../Moose.js')
const Test = require('./testLib.js');

Test.section("TypedArray(String)", (test) => {
	const StringArray = new MooseJS.TypedArray(String);
	const strings = new StringArray(["Hello", "20", new Date(), true]);

	test.check_true("All elements are of type string.", ! strings.find((s) => !s instanceof String));

	test.check_exception("Should throw exception when undefined is pushed", "Value undefined", () => strings.push(undefined))
})

Test.section("TypedArray(Date)", (test) => {
	const DateArray = new MooseJS.TypedArray(Date);
	const dates = new DateArray([ '1991-02-20', 'Mon Sep 10 2018 19:15:45 GMT+0100 (BST)' ]);
	test.check_true("2nd element of dates array is a Date", dates[1].constructor == Date);

	test.check_exception("Should throw exception when bad date is pushed", "String cannot be converted to a date", () => dates.push("bad date"))
})


Test.section("TypedArray.__data_type", (test) => {
	const DateArray = new MooseJS.TypedArray(Date);
	test.check_true("new class attribute __data_type is Date", DateArray.__data_type == Date);
})
