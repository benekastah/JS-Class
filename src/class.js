// ##Introduction
// 
// `Class` is a simple and effective way of creating classes in a javascript program.
// It defines mechanisms for inheritance and does all the irritating work for you. It also
// gives you a base prototype for classes that are made, so they all inherit just a few useful
// functions.
// 
// This should be a fairly approachable read as far as documentation goes, but when you are ready to dive in,
// head over to the unit tests. There you will find examples galore!
// 
// ---

// Just some initial set-up boilerplate...
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
			// Taken from [the Mozilla JS docs](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind "Function Bind").
			bind = function (oThis) {
				if (typeof this !== "function")
					throw new TypeError("Function.prototype.bind - " + 
					  "what is trying to be fBound is not callable");

				var aArgs = Array.prototype.slice.call(arguments, 1), 
					fToBind = this, 
					fNOP = function () {},
					fBound = function () {
						return fToBind.apply((this instanceof fNOP ? this
						    : oThis || window), 
						  aArgs.concat(Array.prototype.slice.call(arguments)));    
					};

				fNOP.prototype = this.prototype;
				fBound.prototype = new fNOP();

				return fBound;
			};
		return bind.call(this, scope);
	};
	
	// ##Class
	//
	// **`Class`**: `Class` is nothing more than a class with the special ability to create classes.
	// Naturally, the classes it makes descend from it and therefore inherit it's useful prototype functions.
	this.Class = (function () {
		function Class() {}
		
		var noInit = { noInit: true };
		
    // Use `Class.def` to define a new class. If the first parameter `Parent` is absent, it assumes
    // that `Parent` should be `Class`, and accepts the first parameter to be the child prototype 
    // object (`childProto`).
    // 
    // For the second argument, you may pass in an object, or a function that returns an
    // object.
		Class.def = Class.define = function (Parent, childProto) {
			if (arguments.length < 2) {
				childProto = Parent;
				Parent = null;
			}
			
			if (!childProto) throw "No child prototype defined.";
			if (!Parent) Parent = Class;
			
			childProto = getObject(childProto);
			
			function ChildClass() {
			     
        // Note: the new `ChildClass` throws an error when invoked improperly (without the `new` operator). 
        // We basically just check
        // to see if `this` is equal to the global object. Since classes can all be used to mixin their
        // properties to another object, this means that classes cannot be mixed in to the global object
        // directly.
				if (this === global)
					throw new TypeError("Class scope cannot be global scope. " +
					  "You must instantiate with `new`.");
				
        // If we don't descend from `Class` (for example, in situations where you extend native Javascript
        // types) then we mixin `Class`'s properties into `this` so we don't have any surprises.
        //
        // **Note**: This means that these kinds of classes are **not** instances of `Class`. We assume it is a class of ours,
        // however, if the class itself has the static property `isClass` set to `true`.
				if (!(this instanceof Class)) {
					Class.mixTo(this.constructor.prototype);
				}
				
				if (ChildClass.noInit !== noInit
				  && typeof this.initialize === "function") {
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
		
    // ###Static Methods
    // These will be shared by its children otherwise noted.
		
		Class.isClass = true;
		
    //     
    // **`Class.extend`**: this is the primary way for setting up inheritance heirarchies. With a class `Person`,
    // `Person.extend({ ... })` is often more convenient than the equivalent alternative, 
    // `Class.def(Person, { ... })`.
    //     
		Class.extend = function (childProto) {
			return Class.define(this, childProto);
		};
		
    //     
    // **`Class.simple`**: makes a simple class from a plain object: by coincidence, the same thing `Class.extend` does.
    // The only difference between these two is that `Class.simple` will not be shared to child classes,
    // meaning that `Class.simple` will only ever extend `Class`. This method is useful when you
    // want to extend a plain object easily and safely.
    //     
		Class.simple = Class.extend;
		
    //     
    // **`Class.mixTo`**: this allows us to use a class as a mixin. It also will add its static properties to the static
    // properties of the receiver's constructor (class) if `applyStatics` is truthy.
    //     
		Class.mixTo = function (receiver, applyStatics) {
			if (!this.mixer) this.mixer = ex.mixer(this.prototype);
			var constructor = receiver.constructor;
			this.mixer.mixTo(receiver);
			receiver.constructor = constructor;
			
			if (applyStatics)
			  applyStaticProperties(this, constructor);
			return receiver;
		};
		
    //     
    // **`Class.singleton`**: handy for when you only want one instance of a particular class. Use it like so:
    // 
    //     var Sun = Class.def({
    //       canKillYou: true
    //       , keepsYouAlive: true
    //     }).singleton();
    // 
    // Any parameters passed in to `singleton` will be passed in turn to the initialize function
    // for the class (if there is one).
    //     
		Class.singleton = function () {
			var ret = prototypeInstance(this);
			if (typeof ret.initialize === "function")
				ret.initialize.apply(ret, arguments);
			return ret;
		};
		
    //     
    // **`Class.implement`**: allows you to implement properties to the class after its initial creation. Especially useful
    // for methods, which undergo a little special work so that we can use `this.supr` to refer to the
    // super function.
    // 
    //     var Thing = Class.define({
    //       ...
    //     });
    //     
    //     ...
    //     
    //     Thing.implement({
    //       initialize: function () { ... }
    //       , someMethod: function () { ... }
    //     });
    // 
    // **Note**: This does not implement static properties. It implements these properties to the class's prototype.
    //     
		Class.implement = function (obj) {
			obj = getObject(obj);
			applyPrototypeProperties(obj, this.prototype);
			return this;
		};
		
    //     
    // **`Class.statics`**: this is the same thing as implement, but for static properties. Mainly useful for adding multiple
    // properties at once. This is also useful for defining static properties in 
    // a terse manner when the class is created:
    // 
    //     var Thing = Class.define({
    //       ...
    //     }).statics({
    //       someStaticProperty: ...
    //       , otherThing: ...
    //       ...
    //     });
    //     
		Class.statics = function (obj) {
			obj = getObject(obj);
			applyStaticProperties(obj, this);
			return this;
		};
		
    //     
    // ### Instance Methods
    //     
		
    //     
    // **`this.method`** *(aliased `defineMethod` and `defMethod`)*: allows you to define new methods on the fly
    // that are able to use the special `this.supr` property to call their super functions.
    // 
    // **Note**: This method should **not** be used this way:
    // 
    //     ...
    //     this.doSomething = this.method("doSomething", function () {
    //       this.supr();
    //     });
    //     ...
    // 
    // It will assign `this.doSomething` to `this`. Instead, simply do this:
    // 
    //     this.method("doSomething", function () {
    //       this.supr();
    //     });
    //     
		Class.prototype.method =
		Class.prototype.defineMethod =
		Class.prototype.defMethod = function (name, fn) {
			this[name] = defineFnWithSuper(this.__super__.prototype, name, fn);
			return this;
		};
		
		// **`this.bind`**: this is useful for binding a method to an instance of the class. It was made for private
		// functions in a class that need (or want) to use `this`.
		//
		//     this.something = "cool"
		//     // this will work:
		//     var a = this.bind(function () { return this.something; });
		Class.prototype.bind = function (fn) {
			return bind.call(fn, this);
		};
		
		// **`this.mixin`** *(aliased `this.include`)*: is the preferred way to perform mixins. Multiple inheritance?
		// *Simple*.
		//
		//     var SomeClass = Class.define({
		//       initialize: function () {
		//         this.mixin(someMixer); // someMixer could also be a class!
		//       }
		//     });
		Class.prototype.mixin =
		Class.prototype.include = function (mixer) {
			return mixer.mixTo(this.constructor.prototype, true);
		};
		
		return Class;
		
		// ###Private Methods
		
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
	
	// ##Mixer
	//
	// **`mixer`**: creates a mixer (read: an item that can be mixed in or included to another object).
	// All mixers have the method `mixTo`, which allows you to specify a target on which to perform the
	// mixin. Either an object or a function may be passed in to `mixer`.
	//
	//     var someMixer = mixer(function () {
	//       this.a = "a";
	//       this.b = "b";
	//     });
	//     // or
	//     var someMixer = mixer({
	//       a: 'a'
	//       , b: 'b'
	//     });
	this.mixer = (function () {
	  function mixer(item) {
  		var ret, object, itemIsFn;
  		if (typeof item  === "function") {
  			object = void 0;
  			ret = function () {
  			  item.apply(this, arguments);
  			};
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