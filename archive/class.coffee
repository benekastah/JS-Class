
if typeof global == "undefined"
  global = this
  
class Class
  @def: (parent, childPrototype) ->
    if arguments.length < 2
      childPrototype = parent
      parent = null
      
    childPrototype or= {}
    parent or= Class
    
    if _$_.isFn childPrototype
      childPrototype = childPrototype()
      
    class ChildClass extends parent
      makePrototype childPrototype, @::
  
  makePrototype = (donor, receiver) ->
    for own prop, value of donor
      if _$_.isFn value
        receiver[prop] = Class::method.call receiver, prop, value
      else
        receiver[prop] = value
  
  ###
  Class.def = Class.define = function (parent, childProto) {
      if (arguments.length < 2) {
          childProto = parent;
          parent = null;
      }
      
      childProto || (childProto = {});
      parent || (parent = Class);
      
      if (typeof childProto === "function")
          childProto = childProto();
      
      function ChildClass() {
          if (this === global)
              throw new TypeError("Class scope cannot be global scope. You must instantiate with `new`.");
          
          if (!(this instanceof Class)) {
              Class.mixTo(this);
          }
          
          if (ChildClass.noInit !== noInit && typeof this.initialize === "function") {
              this.initialize.apply(this, arguments);
          }
      }
      
      ChildClass.prototype = prototypeInstance(parent);
      ChildClass.prototype.constructor = ChildClass;
      ChildClass.prototype.__super__ = parent;
      applyPrototypeProperties(childProto, ChildClass.prototype);
      
      applyStaticProperties(parent, ChildClass);
      
      return ChildClass;
  };
  ###
  
  
  
  
  method: (name, fn) ->
    __super__ = @__super__
    newFn = ->
      tmp = @supr
      supr = __super__::[name]
      
      if _$_.isFn supr
        @supr = _$_.bind supr, this
      else delete @supr
      
      ret = newFn.baseFn.apply this, arguments
      if not tmp?
        delete @supr
      else
        @supr = tmp
        
      ret
    newFn.baseFn = fn
    @[name] = newFn
  defineMethod: method
  defMethod: method
  
  bind: (fn) ->
    _$_.bind fn, this
  
  mixin: (Mixer) ->
    Mixer.mixTo @constructor.prototype
  include: mixin
  
  @extend: (childPrototype) ->
    Class.define this, childPrototype
    
  @mixTo: (receiver) ->
    if not @Mixer then @Mixer = Mixer @prototype
    ctor = receiver.constructor
    this.Mixer.mixTo receiver
    receiver.constructor = ctor
    
    applyStaticProperties this, ctor
    receiver
    
  @singleton: ->
    ret = prototypeInstance this
    if _$_.isFn ret.initialize
      ret.initialize arguments...
    ret
    
  @implement: (obj) ->
    obj = obj() if _$_.isFn obj
    applyPrototypeProperties obj, @prototype
    
  @simple: (prototype) ->
    Class.extend prototype
    

@Class = Class