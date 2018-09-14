#!/usr/bin/env node
'use strict';

const MooseJS = require('../Moose.js');
const Test = require('./testLib.js');

Test.section("Trigger test", (test) => {

	function checkTimes(obj){
		if (obj.start >= obj.end)
			throw Error("Start time is greater than end time for appointment "+ obj.name);
	}

	class Appointment extends MooseJS.defineClass({
		final: true,
		strict: true,
		has: {
			name:  { is:"rw", isa:String, required:true },
			start: { is:"rw", isa:Date,   required:true, trigger:checkTimes},
			end:   { is:"rw", isa:Date,   required:true, trigger:checkTimes},
		}
	})
	{};


	const dentistAppointment = new Appointment({
		name:  "Dentist",
		start: new Date('2018-09-09 12:00:00'),
		end:   new Date('2018-09-09 13:00:00')
	});


	test.check_exception(
		"Error thrown on trigger",
		'Start time is greater than end time for appointment Dentist',
		() => dentistAppointment.start = '2018-09-09 14:00:00'
	);

	test.check_true("Changed value has reverted", dentistAppointment.start.getHours() == 12)
});
