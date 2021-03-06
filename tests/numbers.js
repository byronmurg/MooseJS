#!/usr/bin/env node

const Test = require('./testLib.js');
const MooseJS = require('../Moose.js');

Test.section("Casting to numbers", (test) => {

	class Student extends MooseJS.defineClass({
		final: true,
		has:{
			grades: { is:"rw", isa:[Number], required:true, default:[] },
		}
	})
	{}

	const bob = new Student()

	bob.grades.push(1);
	bob.grades.push("2");

	test.check_true("All elements should be of type Number", () => bob.grades.filter((grade) => typeof(grade) == "number").length == bob.grades.length);

	test.check_exception(
		"Exception thrown when invalid number is set",
		'Object cannot be converted to a number',
		() => bob.grades[2] = {a:1}
	);

})
