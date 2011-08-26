
_$_ =
  hasProp: (obj, prop) ->
    hasProp = Object::hasOwnProperty
    @hasProp = (obj, prop) ->
      hasProp.call obj, prop
    @hasProp arguments...
  
  bind: (fn, obj) ->
    fnBind = Function::bind
    if fnBind
      bind = fnBind
    else
      bind = (scope, boundArgs...) ->
        if typeof this != "function"
          throw new TypeError "_$.bind - the function trying to be bound is not callable"
        
        fn = this
        fNOP = ->
        fBound = (calledArgs...) ->
          fn.apply (if this instanceof fNOP ? this : scope || window), boundArgs.concat(calledArgs)
        
        fNOP.prototype = this.prototype
        fBound.prototype = new fNOP()
        
        fBound
    @bind = (fn, obj) ->
      bind.call obj, fn
    @bind arguments...
  
  isFn: (item) ->
    typeof item == "function"
  
###
var hasProperty = Object.prototype.hasOwnProperty,
bind = function (scope) {
    if (Function.prototype.bind)
        bind = Function.prototype.bind;
    else
        // This function emulates Function.prototype.bind in environments where it is missing.
        // Taken from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
        bind = function (oThis) {
            if (typeof this !== "function") // closest thing possible to the ECMAScript 5 internal IsCallable function
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
###