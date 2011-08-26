var global;
(function () {
  "use strict";
	
	if (typeof global === "undefined")
		global = this;
	var ex = this;
	
	var hasProperty = Object.prototype.hasOwnProperty,
	bind = function (scope) {
		if (Function.prototype.bind)
			bind = Function.prototype.bind;
		else
			// This function emulates Function.prototype.bind in environments where it is missing.
			// Taken from [the Mozilla JS docs](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind "Function Bind")
			bind = function (oThis) {
				if (typeof this !== "function")
					throw new TypeError("Function.prototype.bind - what is trying to be fBound is not callable");

				var aArgs = Array.prototype.slice.call(arguments, 1), 
					fToBind = this, 
					fNOP = function () {},
					fBound = function () {
						return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(Array.prototype.slice.call(arguments)));    
					};

				fNOP.prototype = this.prototype;
				fBound.prototype = new fNOP();

				return fBound;
			};
		return bind.call(this, scope);
	};
	
	this.Class = (function () {
		function Class() {}
		
		var noInit = { noInit: true };
		Class.def = Class.define = function (Parent, childProto) {
			if (arguments.length < 2) {
				childProto = Parent;
				Parent = null;
			}
			
			if (!childProto) throw "No child prototype defined.";
			if (!Parent) Parent = Class;
			
			childProto = getObject(childProto);
			
			function ChildClass() {
				if (this === global)
					throw new TypeError("Class scope cannot be global scope. You must instantiate with `new`.");
				
				if (!(this instanceof Class)) {
					Class.mixTo(this.constructor.prototype);
				}
				
				if (ChildClass.noInit !== noInit && typeof this.initialize === "function") {
					this.initialize.apply(this, arguments);
				}
			}
			
			ChildClass.prototype = prototypeInstance(Parent);
			ChildClass.prototype.constructor = ChildClass;
			ChildClass.prototype.__super__ = Parent;
			applyPrototypeProperties(childProto, ChildClass.prototype);
			
			ChildClass.Parent = Parent;
			applyStaticProperties(Parent, ChildClass);
			
			if (!extendsClass(ChildClass)) {
			  applyStaticProperties(Class, ChildClass);
			}
			
			return ChildClass;
		};
		
		// CLASS METHODS
		Class.isClass = true;
		
		Class.extend = function (childProto) {
			return Class.define(this, childProto);
		};
		
		// Makes a simple class from a plain object. Inadvertently, the same thing Class.extend does.
		Class.simple = Class.extend;
		
		Class.mixTo = function (receiver) {
			if (!this.mixer) this.mixer = ex.mixer(this.prototype);
			var constructor = receiver.constructor;
			this.mixer.mixTo(receiver);
			receiver.constructor = constructor;
			
			applyStaticProperties(this, constructor);
			return receiver;
		};
		
		Class.singleton = function () {
			var ret = prototypeInstance(this);
			if (typeof ret.initialize === "function")
				ret.initialize.apply(ret, arguments);
			return ret;
		};
		
		Class.implement = function (obj) {
			obj = getObject(obj);
			applyPrototypeProperties(obj, this.prototype);
			return this;
		};
		
		Class.statics = function (obj) {
			obj = getObject(obj);
			applyStaticProperties(obj, this);
			return this;
		};
		
		// PROTOTYPE METHODS
		Class.prototype.method =
		Class.prototype.defineMethod =
		Class.prototype.defMethod = function (name, fn) {
			this[name] = defineFnWithSuper(this.__super__.prototype, name, fn);
			return this;
		};
		
		Class.prototype.bind = function (fn) {
			return bind.call(fn, this);
		};
		
		Class.prototype.mixin =
		Class.prototype.include = function (mixer) {
			return mixer.mixTo(this.constructor.prototype);
		};
		
		return Class;
		
		// PRIVATE METHODS
		function extendsClass(cls) {
		  if (cls.isClass) return true;
		  else return false;
		}
		
		function prototypeInstance(Parent) {
			var tmp = Parent.noInit;
			Parent.noInit = noInit;
			var proto = new Parent();
			
			if (Parent.noInit == null)
				delete Parent.noInit;
			else
				Parent.noInit = tmp;
				
			return proto;
		}
		
		function applyPrototypeProperties(donor, receiver) {
			for (var property in donor) {
				if (!hasProperty.call(donor, property)) continue;
				var value = donor[property];
				if (typeof value === "function")
					Class.prototype.defineMethod.call(receiver, property, value);
				else
					receiver[property] = value;
			}
			return receiver;
		}
		
		function applyStaticProperties(donor, receiver) {
			for (var property in donor) {
				if (!hasProperty.call(donor, property)) continue;
				if (isUnwantedItem(donor, property)) continue;
				var value = donor[property];
				if (typeof value === "function")
					receiver[property] = defineFnWithSuper(receiver.Parent, property, value);
				else
					receiver[property] = donor[property];
			}
			
			function isUnwantedItem(Parent, prop) {
				if (Parent !== Class) {
					return prop === "Parent";
				} else {
					return prop === "define" || prop === "def" || prop === "simple";
				}
			}
		}
		
		function getObject(obj) {
			return typeof obj === "function" ? obj() : obj;
		}
		
		function defineFnWithSuper (__super__, name, fn) {
			return function () {
				var tmp = this.supr,
				supr = __super__[name];
				
				if (typeof supr === "function")
					this.supr = bind.call(supr, this);
				else delete this.supr;
				
				var ret = fn.apply(this, arguments);
				if (tmp == null)
					delete this.supr;
				else
					this.supr = tmp;
					
				return ret;
			};
		}
	})();
	
	this.mixer = (function () {
	  function mixer(item) {
  		var ret, object, itemIsFn;
  		if (typeof item  === "function") {
  			object = void 0;
  			ret = item;
  		} else {
  			object = item;

  			ret = function () {
  				for (var property in object) {
  					if (!hasProperty.call(object, property)) continue;
  					this[property] = object[property];
  				}
  			};
  		}

  		ret.mixTo = bind.call(mixTo, ret);

  		return ret;
  	};
    
    return mixer;
    
  	function mixTo(receiver) {
  		var config = Array.prototype.slice.call(arguments, 1);
  		this.apply(receiver, config);
  		return receiver;
  	};
	})();
	
}).call(this);