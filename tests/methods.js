#!/usr/bin/env node
'use strict';

const MooseJS = require('../Moose.js')
const Test = require('./testLib.js');

const {method} = MooseJS

Test.section("Basic methods", (test) => {
	const test_method = method({
		input: {
			num: { is: "ro", isa: Number, required: true },
		},
		output: Number,
		body: ({ num }) => num * 30,
	})

	test.check_exception("incorrect type results in error", "String cannot be converted to a number", () => test_method({ num:"bad number" }))

	test.check_exception("property is required", 'Property "num" of "input" required', () => test_method())

	test.check_exception("additional properties are rejected", 'Unknown paramater "foo" passed to "input"', () => test_method({ num:5, foo:"bar" }))

	test.check_true("result is correct", () => 120 === test_method({ num: 4 }))
})


Test.section("Input-less methods", (test) => {
	const test_method = method({
		output: Number,
		body: () => 21,
	})

	test.check_true("result is correct", () => 21 === test_method())
})

Test.section("Output-less methods", (test) => {
	const test_method = method({
		body: () => {},
	})

	test.check_safe("call doesn't error", () => test_method())
	test.check_safe("call returns undefined", () => undefined === test_method())
})

Test.section("Asynchronous methods", async (test) => {
	const test_method = method({
		output: Number,
		body: async () => 101,
	})

	const output = await test_method()

	test.check_true("Output is correct", () => output === 101)
})

Test.section("Class methods", (test) => {

	class TestClass {
		constructor(start) {
			this.start = start
		}

		somemeth = method({
			input: Number,
			output: Number,
			body: num => num * this.start,
		})
	}

	const tClass = test.check_safe("Class can be instantiated", () => new TestClass(15))

	test.check_true("result is correct", () => 30 === tClass.somemeth(2))
})

Test.section("'Old' class methods", (test) => {

	function AnotherTest(start) {
		this.start = start
	}

	AnotherTest.prototype.someMeth = method({
		input: Number,
		output: Number,
		body: function(num) {
			return num * this.start
		},
	})

	const aClass = test.check_safe("Class can be instantiated", () => new AnotherTest(33))

	test.check_true("result is correct", () => 66 === aClass.someMeth(2))
})


Test.section("With moose classes", (test) => {
	class Student extends MooseJS.defineClass({
		final: true,
		has: {
			name:   { is:"ro", isa:String,   required:true },
			grades: { is:"rw", isa:[Number], required:true, default:[] },
		}
	})
	{
		getGradesAbove = method({
			input: Number,
			output: [Number],
			body: function(input){
				return this.grades.filter((grade) => grade >= input)
			}
		})
	}

	test.check_safe("Can instanctiate", () => new Student({ name:"Testy" }))

	const student = new Student({
		name: "Testy McTesterson",
		grades: [1, 2, 3]
	})

	test.check_true("Method output is correct", () => student.getGradesAbove(2).length == 2)
})

Test.section("Method metadata", (test) => {
	const test_method = method({
		input: {
			num: { isa:Number, required:true, default: 1},
		},
		output: Number,
		body: ({num}) => num * 21,
	})

	test.check_true("result is correct", () => 210 === test_method({ num: 10 }))

	test.check_true("input is a class", () => test_method.input instanceof Function)

	test.check_true("input paramater has been cast as moose paramater", () => test_method.input.__class_properties.num.is == "ro")
})
