#!/usr/bin/env node
'use strict';

const MooseJS = require('../Moose.js');
const Test = require('./testLib.js');

Test.section("Trigger test", (test) => {

	function checkTimes(obj){
		if (obj.start >= obj.end){
			throw Error("Start time is greater than end time for appointment "+ obj.name);
		};
	};

	function checkNameRequired(obj){
		if (! obj.name){
			if (obj.end - obj.start > 1800000){
				throw Error(`Appointments greater than 30 minutes must have a name`);
			};
		};
	};

	class Appointment extends MooseJS.defineClass({
		final: true,
		has: {
			name: { is:"rw", isa:String, trigger:checkNameRequired },
			start:{ is:"rw", isa:Date,   required:true, trigger:checkTimes},
			end:  { is:"rw", isa:Date,   required:true, trigger:checkTimes},
		}
	})
	{};

	const dentistAppointment = new Appointment({
		name:  "Dentist",
		start: new Date('2018-09-09 12:00:00'),
		end:   new Date('2018-09-09 13:00:00')
	});

	test.check_exception(
		"Trigger is called and throws exception when start is changed",
		"Start time is greater than end time for appointment Dentist",
		() => dentistAppointment.start = '2018-09-09 14:00:00'
	);

	test.check_true("Changed value has reverted", dentistAppointment.start.getHours() == 12);

	test.check_exception(
		"Trigger is called and error thrown when name is deleted",
		"Appointments greater than 30 minutes must have a name",
		() => {delete dentistAppointment.name}
	);

	test.check_true("Deleted value has reverted", dentistAppointment.name == "Dentist");
});
