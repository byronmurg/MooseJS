#!/usr/bin/env node

const MooseJS = require('../Moose.js');

class Student extends MooseJS.defineClass({
	final: true,
	has:{
		grades: { is:"ro", isa:[Number], required:true, default:[] },
	}
})
{
	
}

const bob = new Student()

bob.grades.push(1);
bob.grades.push("2");

