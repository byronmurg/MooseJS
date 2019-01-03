/* 
 * MooseJS
 *
 * https://moosejs.omanom.com/
 *
 * Copyright (c) 2018 Byron Murgatroyd.
 *
 * Permission to use, copy, modify, and/or distribute this software for any purpose with or 
 * without fee is hereby granted, provided that the above copyright notice and this permission
 * notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO 
 * THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT
 * SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR
 * ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF
 * CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE
 * OR PERFORMANCE OF THIS SOFTWARE.
 */
'use strict';

const MooseJS = (function(){

function castTo(type, value){
	const valueType = className(value);

	switch (type){
		case value.constructor:
			return value;
		case Array:
			throw Error(`Cannot convert ${valueType} to Array`);
		case Number:
			if (isNaN(value)){
				throw TypeError(`"${value}" cannot be converted to a number`);
			};
			//Fallthrough
		default:
			return (value instanceof type) ? value : new type(value);
	}
};

function className(obj){
	return obj.constructor.name || 'unnamed class';
}

function TypedArray(type){
	if (Array.isArray(type) || type == Array){
		throw TypeError("Cannot cast to TypedArray<Array>");
	};

	const accessors = {
		set: function(obj, prop, value){
			if (! isNaN(prop)){
				value = castTo(type, value);
			};
			obj[prop] = value;
			return true;
		},
	};

	const ArrayClass = function(values){
		values = values || [];

		if (! Array.isArray(values)){
			throw TypeError("Non array passed");
		};

		values = values.map(function(value){ return castTo(type, value); });

		return new Proxy(values, accessors);
	};

	ArrayClass.__data_type = type;

	return ArrayClass;
};

function createClass(construct, parent){
	return (parent)
		? class extends parent {
			constructor(...args){
				super(...args);
				return construct.call(this, ...args);
			}
		}
		: class {
			constructor(...args){
				return construct.call(this, ...args);
			}
		};
};

function defineInterface(options){
	options = options || {};
	const members = options.members || [];
	const properties = options.properties || {};

	const checkedConstructors = {};

	function checkClass(obj){
		if (checkedConstructors[obj.constructor]){
			return;
		};

		for (const member of members){
			if (! (obj.__proto__[member] && obj.__proto__[member].constructor instanceof Function)){
				throw TypeError(`Interface member "${member}" not defined in "${className(obj)}"`);
			};
		};

		const classProperties = obj.constructor.__class_properties || {};
		for (const property in properties){
			const propertyType  = properties[property];
			const classProperty = classProperties[property];

			if (!classProperty){
				throw Error(`Property "${property}" not defined in "${className(obj)}"`);
			};

			if (!classProperty.required){
				throw Error(`Property "${property}" is not required in "${className(obj)}" to conform to interface`);
			};

			if (!(classProperty.isa == propertyType || propertyType.prototype instanceof classProperty.isa)){
				throw TypeError(`Property "${property}" of "${className(obj)}" must be type "${propertyType.name}" to conform to interface`);
			};
		};

		checkedConstructors[obj.constructor] = true;
	};

	function checkNotInvoked(obj){
		if (obj.constructor == inter){
			throw TypeError(`Interface cannot be directly invoked`);
		};
	};

	function construct(){
		checkNotInvoked(this);
		checkClass(this);
		return this;
	};

	const inter = createClass(construct, options.extends);

	return inter;
};

class Property {
	constructor(name, details){
		this.name       = name;
		this.is         = details.is;
		this.isa        = details.isa;
		this.required   = details.required;
		this.default    = details.default;
		this.enumerable = details.enumerable;
		this.trigger    = details.trigger;

		if (this.enumerable == undefined){
			this.enumerable = true;
		};

		if (! this.name){
			throw Error("No name defined for property");
		};

		if (! this.is){
			throw Error(`No accessor defined for ${this.name}, use {is:"rw"} or {is:"ro"}`);
		};

		if (! this.isa){
			throw Error(`No type defined for ${this.name}, please use {isa:Object} to accept any class`);
		};

		if (! ['ro', 'rw'].includes(this.is)){
			throw Error(`Bad accessor for ${this.name}, use {is:"rw"} or {is:"ro"}`);
		};

		if (Array.isArray(this.isa)){
			if (this.isa.length != 1){
				throw TypeError(`Invalid array type for ${this.name}!`);
			};
			this.isa = new TypedArray(this.isa[0]);
		};
	};

	cast(value){
		return castTo(this.isa, value);
	};

	getDefault(){
		return (this.default instanceof Function && this.isa != Function)
			? this.default()
			: this.default;
	};

	runTrigger(obj, value, oldValue){
		if (this.trigger){
			this.trigger(obj, value, oldValue, this.name);
		};
	};

	check(value, obj){
		if (value == undefined){
			if (this.required){
				throw Error(`Property "${this.name}" of "${className(obj)}" required`);
			};
		} else {
			value = this.cast(value);
		};
		return value;
	};

	checkDelete(obj){
		if (this.required){
			throw Error(`Cannot delete required property "${this.name}" of class "${className(obj)}"`);
		};
	};

	checkInitial(value, obj){
		if (value == undefined){
			value = this.getDefault();
		};
		return this.check(value, obj);
	};

	checkSet(value, obj){
		if (this.is == 'ro'){
			throw Error(`Property "${this.name}" of "${className(obj)}" is read only`);
		};
		return this.check(value, obj);
	};
};

const defineClass = function(options){

	const properties = {}, has = options.has || {};

	for (const propName in has){
		properties[propName] = new Property(propName, has[propName]);
	};

	const allProperties = (options.extends)
		? Object.assign({}, properties, options.extends.__class_properties || {})
		: properties;

	// defineProperties sets the initial values of each paramater.
	// Will set a default value if none is supplied.
	function defineProperties(initialValues){
		initialValues = initialValues || {};

		for (const propName in properties){
			const property = properties[propName];
			this[propName] = property.checkInitial(initialValues[propName], this);
		};

		for (const propName in properties){
			const property = properties[propName];
			property.runTrigger(this, this[propName]);
		};

		if (options.final){
			for (const key in initialValues){
				if (!(key in this)){
					throw Error(`Unknown paramater "${key}" passed to "${className(this)}"`);
				};
			}
		};
	};

	const accessors = {
		set(obj, prop, newValue){
			const property = allProperties[prop];
			const oldValue = obj[prop];
			if (property){
				newValue = property.checkSet(newValue, obj);
			} else if (options.final){
				throw Error(`No such property "${prop}" of "${className(obj)}"`);
			};

			obj[prop] = newValue;

			if (property && property.trigger){
				try {
					property.runTrigger(obj, obj[prop], oldValue);
				} catch (e) {
					obj[prop] = oldValue;
					throw e;
				}
			};

			return true;
		},

		deleteProperty(obj, prop){
			const property = properties[prop];
			const oldValue = obj[prop];
			if (property){
				property.checkDelete(obj);
			};

			delete obj[prop];

			if (property){
				property.runTrigger(this, undefined, oldValue);
			};
			return true;
		},

		getOwnPropertyDescriptor(obj, prop){
			const property = properties[prop];
			return (! property)
				? Object.getOwnPropertyDescriptor(obj, prop)
				: { configurable:true, enumerable:property.enumerable, value:obj[prop] };
		}
	};

	function construct(initialValues){
		defineProperties.call(this, initialValues);
		return new Proxy(this, accessors);
	};

	const newClass = createClass(construct, options.extends);
	newClass.__class_properties = allProperties;
	return newClass;
};

return { defineClass, TypedArray, defineInterface };

}());

if (typeof module === "object" && typeof module.exports === "object"){
	module.exports = MooseJS;
};
