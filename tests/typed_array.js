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

Test.section("TypedArray triggers", (test) => {

	function numberMustBeLessThanTen(n){
		if (n >= 10){
			throw Error("Number must be less than 10")
		}
	}

	const NumberArray = new MooseJS.TypedArray({ value:Number, is:"rw", trigger:(array, newValue) => numberMustBeLessThanTen(newValue) })

	const numberArray = new NumberArray([1,2,3])

	test.check_exception("Should throw an exception when breaking the trigger", "Number must be less than 10", () => {
		numberArray.push(20)
	})

	test.check_true("Should have reverted to pre-change", () => numberArray.length == 3)

	test.check_exception("Should throw an exception when breaking the trigger in initialization", "Number must be less than 10", () => {
		new NumberArray([ 100, 200, 300 ])
	})
})

Test.section("Shorthand syntax", (test) => {

	const Foo = MooseJS.defineClass({
		final: true,
		has: {
			numbers: { is:"ro", isa:[Number], required:true },
		},
	})

	const foo = new Foo({ numbers:[1,2,3] })

	test.check_exception("Shorthand declaired TypedArray<Number> is now read-only", "Array is read-only", () => {
		foo.numbers.push(4)
	})

	const Bar = MooseJS.defineClass({
		final: true,
		has: {
			numbers: { is:"rw", isa:[Number], required:true },
		},
	})

	const bar = new Bar({ numbers:[1,2,3] })

	test.check_safe("Shorthand declaired TypedArray<Number> is not read-only", () => {
		bar.numbers.push(4)
	})
})
