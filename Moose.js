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
'use strict'

const MooseJS = (function(){

function className(obj){
	return obj.name || obj.__class_name || 'unnamed class'
}

function objectClassName(obj){
	if (obj == undefined) return "undefined"
	return className(obj.constructor)
}

function castTo(type, value){
	const valueType = objectClassName(value)

	if (value == undefined){
		throw TypeError(`Value undefined`)
	}

	switch (type){
		case value.constructor:
			return value
		case Buffer:
			return Buffer.from(new String(value))
		case Array:
			throw Error(`Cannot convert ${valueType} to Array`)
		case Date:
			value = new Date(value)
			if (isNaN(value)){
				throw TypeError(`${valueType} cannot be converted to a date`)
			}
			return value
		case Number:
			if (isNaN(value)){
				throw TypeError(`${valueType} cannot be converted to a number`)
			}
			//Fallthrough
		default:
			return (value instanceof type) ? value : new type(value)
	}
}

function checkTypedArrayValueIsNotArray(type){
	if (Array.isArray(type) || type == Array){
		throw TypeError("Cannot cast to TypedArray<Array>")
	}
}

function createBasicTypedArrayAccessors(type){
	checkTypedArrayValueIsNotArray(type)
	return {
		get(obj, prop){
			if (prop == "shift"){
				return function(){
					for (let i = 0; i < this.length -1 ; i++){
						obj[i] = obj[i+1]
					}
					this.length -= 1
				}
			} else if (prop == "pop") {
				return function(){
					this.length -= 1
				}
			} else {
				return obj[prop]
			}
		},
		set(obj, prop, value){
			if (! isNaN(prop)){
				value = castTo(type, value)
			}
			obj[prop] = value
			return true
		},
		deleteProperty(obj, prop){
			throw Error("Cannot delete typed array elements")
			return true
		},
	}
}

function createAdvancedTypedArrayAccessors(input){
	const is = input.is || "ro",
	      isa = input.isa || input.value,
	      trigger = input.trigger

	const accessors = createBasicTypedArrayAccessors(isa)

	accessors.set = (obj, prop, value) => {
		if (! isNaN(prop)){

			if (is != "rw"){
				throw Error("Array is read-only")
			}

			const newValue = castTo(isa, value),
			      oldValue = obj[prop]

			obj[prop] = newValue

			if (trigger){
				try {
					trigger(obj, newValue, oldValue, prop)
				} catch (e){
					obj[prop] = oldValue

					if (obj[obj.length - 1] == undefined){
						obj.pop()
					}

					throw e
				}
			}
		} else if (prop == 'length') {
			if (is != "rw"){
				throw Error("Array is read-only")
			}

			const oldLength = obj[prop]
			const oldValue = obj[oldLength - 1]
			obj.length = value

			if (oldLength > value){
				if (trigger){
					trigger(obj, undefined, oldValue, value)
				}
			}

		} else {
			obj[prop] = value
		}
		return true
	}
	return accessors
}

function deduceTypedArrayAccessors(input){
	if (input instanceof Function){
		return createBasicTypedArrayAccessors(input)
	} else if ("object" == typeof input) {
		return createAdvancedTypedArrayAccessors(input)
	} else {
		throw Error("Incorrect TypedArray specifier. Must be Function or Object")
	}
}

function deduceTypedArrayType(input){
	if ("object" == typeof input) {
		return input.isa || input.value
	} else {
		return input
	}
}

function TypedArray(input){

	const accessors = deduceTypedArrayAccessors(input)
	const type = deduceTypedArrayType(input)
	const trigger = input.trigger || function(){}
	
	return Object.assign(function(values){
		values = values || []

		if (! Array.isArray(values)){
			throw TypeError("Non array passed")
		}

		values = values.map(function(value, i){
			value = castTo(type, value)
			trigger(values, value, undefined, i)
			return value
		})

		return new Proxy(values, accessors)
	}, {
		__moose_type:"array",
		__data_type: type,
		__class_name:`TypedArray<${className(type)}>`,
	})
}

function TypedMap(options){
	const {key, value, is, trigger} = options

	if (! key){
		throw Error("No key type passed to TypedMap")
	} else if (key.constructor != Function){
		throw TypeError("key type must be a class")
	}

	if (! value){
		throw Error("No value type passed to TypedMap")
	} else if (value.constructor != Function){
		throw TypeError("value type must be a class")
	}

	return Object.assign(class extends Map {
		constructor(input){
			super([])
			if (Array.isArray(input)){
				input.forEach((pair) => this.set(pair[0], pair[1]))
			} else if (input instanceof Map){
				input.forEach((v, k) => this.set(k, v))
			} else {
				for (const k in input){
					const v = input[k]
					this.set(k, v)
				}
			}
		}

		delete(k){
			if (is == "ro"){
				throw Error("Map is read-only")
			}

			const oldValue = this.get(k)
			const existed = super.delete(k)

			if (trigger){
				try {
					trigger(this, undefined, oldValue, k)
				} catch (e){
					super.set(k, oldValue)
					throw e
				}
			}

			return existed
		}
		
		set(k, v){
			if (is == "ro"){
				throw Error("Map is read-only")
			}

			k = castTo(key, k)
			v = castTo(value, v)

			const oldValue = this.get(k)

			super.set(k, v)

			if (trigger){
				try {
					trigger(this, v, oldValue, k)
				} catch (e){
					if (oldValue == undefined){
						super.delete(k)
					} else {
						super.set(k, oldValue)
					}
					throw e
				}
			}
			return this
		}
	}, {
		__moose_type:"map",
		__data_type:value,
		__key_type:key,
		__class_name:`TypedMap<${className(key)},${className(value)}>`,
	})
}

function createClass(construct, parent){
	return (parent)
		? class extends parent {
			constructor(...args){
				super(...args)
				return construct.call(this, ...args)
			}
		}
		: class {
			constructor(...args){
				return construct.call(this, ...args)
			}
		}
}

function defineInterface(options){
	options = options || {}
	const members = options.members || []
	const properties = options.properties || {}

	const checkedConstructors = {}

	function checkClass(obj){
		if (checkedConstructors[obj.constructor]){
			return
		}

		for (const member of members){
			if (! (obj.__proto__[member] && obj.__proto__[member].constructor instanceof Function)){
				throw TypeError(`Interface member "${member}" not defined in "${objectClassName(obj)}"`)
			}
		}

		const classProperties = obj.constructor.__class_properties || {}
		for (const property in properties){
			const propertyType  = properties[property]
			const classProperty = classProperties[property]

			if (!classProperty){
				throw Error(`Property "${property}" not defined in "${objectClassName(obj)}"`)
			}

			if (!classProperty.required){
				throw Error(`Property "${property}" is not required in "${objectClassName(obj)}" to conform to interface`)
			}

			if (!(classProperty.isa == propertyType || classProperty.isa.prototype instanceof propertyType)){
				throw TypeError(`Property "${property}" of "${objectClassName(obj)}" must be type "${propertyType.name}" to conform to interface`)
			}
		}

		checkedConstructors[obj.constructor] = true
	}

	function checkNotInvoked(obj){
		if (obj.constructor == inter){
			throw TypeError(`Interface cannot be directly invoked`)
		}
	}

	function construct(){
		checkNotInvoked(this)
		checkClass(this)
		return this
	}

	const inter = createClass(construct, options.extends)
	inter.__moose_type = "interface"

	return inter
}

class Property {
	constructor(name, details){
		this.name       = name
		this.is         = details.is
		this.isa        = details.isa || Object
		this.required   = details.required
		this.default    = details.default
		this.enumerable = details.enumerable
		this.trigger    = details.trigger

		if (this.enumerable == undefined){
			this.enumerable = true
		}

		if (! this.name){
			throw Error("No name defined for property")
		}

		if (! this.is){
			throw Error(`No accessor defined for ${this.name}, use {is:"rw"} or {is:"ro"}`)
		}

		if (! ['ro', 'rw'].includes(this.is)){
			throw Error(`Bad accessor for ${this.name}, use {is:"rw"} or {is:"ro"}`)
		}

		if (Array.isArray(this.isa)){
			if (this.isa.length != 1){
				throw TypeError(`Invalid array type for ${this.name}!`)
			}
			this.isa = new TypedArray({
				is:this.is,
				isa:this.isa[0],
			})
		}
	}

	getDefault(){
		return (this.default instanceof Function)
			? this.default()
			: this.default
	}

	runTrigger(obj, value, oldValue){
		if (this.trigger){
			this.trigger(obj, value, oldValue, this.name)
		}
	}

	checkRequired(value, obj){
		if (value == undefined){
			if (this.required){
				throw Error(`Property "${this.name}" of "${objectClassName(obj)}" required`)
			}
		}
	}

	checkInit(value){
		return (value == undefined) ? this.getDefault() : value
	}

	checkDelete(obj){
		if (this.required){
			throw Error(`Cannot delete required property "${this.name}" of class "${objectClassName(obj)}"`)
		}
	}

	checkSet(obj){
		if (this.is == 'ro'){
			throw Error(`Property "${this.name}" of "${objectClassName(obj)}" is read only`)
		}
	}
}

const defineClass = function(options){

	const properties = {}, has = options.has || {}

	for (const propName in has){
		properties[propName] = new Property(propName, has[propName])
	}

	const allProperties = (options.extends)
		? Object.assign({}, properties, options.extends.__class_properties || {})
		: properties

	// defineProperties sets the initial values of each paramater.
	// Will set a default value if none is supplied.
	function defineProperties(initialValues){
		initialValues = initialValues || {}

		for (const propName in properties){
			const property = properties[propName]
			const value = property.checkInit(initialValues[propName])
			property.checkRequired(value, this)
			this[propName] = value == undefined ? undefined : castTo(property.isa, value)
		}

		for (const propName in properties){
			const property = properties[propName]
			property.runTrigger(this, this[propName])
		}

		if (options.final){
			for (const key in initialValues){
				if (!(key in this)){
					throw Error(`Unknown paramater "${key}" passed to "${objectClassName(this)}"`)
				}
			}
		}
	}

	const accessors = {
		set(obj, prop, newValue){
			const property = allProperties[prop]
			const oldValue = obj[prop]
			if (property){
				property.checkSet(obj)
				property.checkRequired(newValue, obj)
				if (newValue != undefined){
					newValue = castTo(property.isa, newValue)
				}
			} else if (options.final){
				throw Error(`No such property "${prop}" of "${objectClassName(obj)}"`)
			}

			obj[prop] = newValue

			if (property && property.trigger){
				try {
					property.runTrigger(obj, obj[prop], oldValue)
				} catch (e) {
					obj[prop] = oldValue
					throw e
				}
			}

			return true
		},

		deleteProperty(obj, prop){
			const property = properties[prop]
			const oldValue = obj[prop]
			if (property){
				property.checkDelete(obj)
			}

			delete obj[prop]

			if (property){
				try {
					property.runTrigger(obj, undefined, oldValue)
				} catch (e){
					obj[prop] = oldValue
					throw e
				}
			}
			return true
		},

		getOwnPropertyDescriptor(obj, prop){
			const property = properties[prop]
			return (! property)
				? Object.getOwnPropertyDescriptor(obj, prop)
				: { configurable:true, enumerable:property.enumerable, value:obj[prop] }
		}
	}

	function construct(initialValues){
		defineProperties.call(this, initialValues)
		return new Proxy(this, accessors)
	}

	const newClass = createClass(construct, options.extends)
	newClass.__moose_type = "class"
	newClass.__class_properties = allProperties
	newClass.__class_name = options.name
	return newClass
}

function defineEnum(posibilities, options = {}){
	return Object.assign( class extends String {
		constructor(input){
			super(input)
			if (! posibilities.includes(input)){
				throw TypeError(`Invalid input "${input}" for enum` + (options.name ? ` ${options.name}` : ""))
			}

		}
		toBSON(){ return this.toString() }
		toJSON(){ return this.toString() }
	}, {
		__moose_type:"enum",
		__class_name:options.name,
		__class_posibilities:posibilities,
	})
}

function serialize(c){
	if (c == undefined){
		return undefined
	} else if (c.__moose_type) {
		const ret = {
			type: c.__moose_type,
			name: className(c),
		}

        switch (c.__moose_type){
			case "class":
				const properties = {}
				for (const k in c.__class_properties){
					const prop = c.__class_properties[k]

					properties[k] = { 
						isa:serialize(prop.isa),
						required:prop.required || (! 'default' in prop),
					}
				}
				ret.properties = properties
				break
			case "map":
				ret.key_type = serialize(c.__key_type)
			case "array":
				ret.data_type = serialize(c.__data_type)
				break
			case "enum":
				ret.posibilities = c.__class_posibilities
				break
        }

		return ret
    } else {
		return className(c)
	}
}


return { defineClass, TypedArray, TypedMap, defineInterface, defineEnum, serialize }

}())

if (typeof module === "object" && typeof module.exports === "object"){
	module.exports = MooseJS
}
