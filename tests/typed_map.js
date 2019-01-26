#!/usr/bin/env node
'use strict';

const MooseJS = require('../Moose.js')
const Test = require('./testLib.js');

Test.section("TypedMap sanity Check", (test) => {
	test.check_safe("Can instanciate TypedMap", () => { new MooseJS.TypedMap({ key:String, value:Number }) })

	test.check_exception("Exception is thrown when no key type is passed", "No key type passed to TypedMap", () => new MooseJS.TypedMap({ value:String }))
	test.check_exception("Exception is thrown when no value type is passed", "No value type passed to TypedMap", () => new MooseJS.TypedMap({ key:String }))
})

Test.section("TypedMap({ key:String, value:String })", (test) => {
	const StringMap = new MooseJS.TypedMap({ key:String, value:String })
	let strings
	test.check_safe("String map can be instanciated", () => strings = new StringMap({ greeting:"Hello", age:20, dob:new Date(), alive:true}))

	test.check_true("Input Date should now be type String", () => strings.get("dob").constructor == String)

	test.check_exception("Should throw exception when undefined is pushed", "Value undefined", () => {strings.set("something", undefined)})

	let copy
	test.check_safe("Map can be copied from another Map", () => copy = new StringMap(strings))

	test.check_safe("Copy value can be set",       () => copy.set("greeting", "Gooday mate"))
	test.check_true("Copy value has been changed", () => copy.get("greeting") == "Gooday mate")
	test.check_true("Original value is still the same", () => strings.get("greeting") == "Hello")
})

Test.section("Initializing from an Array", (test) => {
	const DateMap = new MooseJS.TypedMap({ key:String, value:Date })

	let dates
	test.check_safe("Date map can me instanciated from an array", () => dates = new DateMap([ ["Byron","1991-02-20"], ["Testy", "1987-10-09"] ]))

	test.check_true("Second value has been cast correctly", () => dates.get("Testy").constructor == Date)
})

Test.section("Copying maps of different types", (test) => {
	const StringMap = new MooseJS.TypedMap({ key:String, value:String })

	const strings = new StringMap({ "one":1, "two":2 })

	test.check_true("First element value is type String", () => strings.get("one").constructor == String)

	const NumberMap = new MooseJS.TypedMap({ key:String, value:Number })

	let numbers
	test.check_safe("Number array can be initialized from string array", () => numbers = new NumberMap(strings))

	test.check_true("First element value is type Number", () => numbers.get("one").constructor == Number)
	test.check_true("First element value is 1", () => numbers.get("one") == 1)
})
