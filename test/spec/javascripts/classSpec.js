try {
  var Class = require("../../../build/class").Class;
  var mixer = require("../../../build/class").mixer;
} catch (e) {}

var Person = Class.define({
  initialize: function (config) {
    this.name = config.name;
    this.gender = config.gender;
    this.age = config.age;
  }
  
  , eat: function (food) {
    return this.name + " ate " + food;
  }
  
  , walk: function (place) {
    return this.name + " walked to " + place;
  }
});

var Super = Person.extend({
  initialize: function (config) {
    this.superName = config.superName;
    this.method("superPower", config.superPower);
    this.supr(config);
  }
});

var GreekGod = Super.extend(function () {
  var self = {};
  var home = "Mount Olympus";
  self.initialize = function (config) {
    this.supr(config);
  };
  
  self.home = function () {
    return this.name === "Hades" ? "the Underworld" : home;
  };
  
  return self;
});

var SArray = Class.define(Array, {
  initialize: function () {
    for (var i=0, len=arguments.length; i<len; i++) {
      this.push(arguments[i]);
    }
  }
  , get: function (i) {
    return this[i < 0 ? this.length + i : i];
  }
  , last: function () {
    return this.get(-1);
  }
});

var Range = SArray.extend({
  initialize: function(a,b) {
    for (; a<=b; a++) this.push(a);
  }
});

describe("`Class` instance", function () {
  
  var jim, superman, zuess, hades, universeMan;
  
  it("should run the `initialize` function upon creation of a class", function () {
    jim = new Person({
      name: "Jim"
      , gender: "M"
      , age: 27
    });
    
    expect(jim.name).toEqual("Jim");
    expect(jim.age).toEqual(27);
    expect(jim.gender).toEqual("M");
  });
  
  it("should have methods that can access its properties via `this`", function () {
    expect(jim.eat("spaghetti")).toEqual("Jim ate spaghetti");
    expect(jim.walk("the supermarket")).toEqual("Jim walked to the supermarket");
  });
  
  it("should have methods that can call `this.supr` for the super function", function () {
    superman = new Super({
      name: "Clark Kent"
      , superName: "Superman"
      , superPower: function (power) {
        return this.superName + " excersized his power of " + power;
      }
      , age: Infinity
      , gender: "M"
    });
    
    expect(superman.name).toEqual("Clark Kent");
  });
  
  it("`this.supr` should work even with several layers", function () {
    universeMan = GreekGod.extend({
      initialize: function (config) {
        this.supr(config);
      }

      , eonsSinceLastNap: function () {
        return new Date().getTime();
      }
    }).singleton({
      name: "Jimmothy Bones"
      , superName: "Universe Man"
      , superPower: function () { return null; }
      , age: Infinity
      , gender: "M"
    });
    
    expect(universeMan.name).toEqual("Jimmothy Bones");
  });
  
  it("should allow dynamic addition of methods at runtime through the use of `this.method`", function () {
    expect(superman.superPower("flight")).toEqual("Superman excersized his power of flight");
  });
  
  it("should be able to extend other classes", function () {
    expect(superman.eat("trains")).toEqual("Clark Kent ate trains");
  });
  
  it("has singleton classes created through the use of `Class.define(/*...*/).singleton(/*...*/)`", function () {
    expect(universeMan.eonsSinceLastNap()).toEqual(new Date().getTime());
  });
  
  it("has prototypes that can be defined as functions which return an object", function () {
    zeuss = new GreekGod({ name: "Zeuss" });
    hades = new GreekGod({ name: "Hades" });
    
    expect(zeuss.home()).toEqual("Mount Olympus");
    expect(hades.home()).toEqual("the Underworld");
  });
  
  it("can implement methods to a class after the class has been created", function () {
    Person.implement({
      rockOut: function () {
        return "major rockage";
      }
      , sleep: function () {
        this.isAsleep = true;
        return this.name + " is sleeping";
      }
      , wakeUp: function () {
        this.isAsleep = false;
        return this.name + " is waking up";
      }
    });
    
    jim.sleep();
    expect(jim.isAsleep).toEqual(true);
    jim.wakeUp();
    expect(jim.isAsleep).toEqual(false);
    expect(jim.rockOut()).toEqual("major rockage");
  });
  
  it("can extend native classes", function () {
    var arr = new SArray(1, 2, 3, 4, 5);
    expect(arr.last()).toEqual(5);
    expect(arr.get(-3)).toEqual(3);
    expect(arr.push(6)).toEqual(6);
    
    var r = new Range(-3, 100);
    expect(r.length).toEqual(104);
    expect(r.last()).toEqual(100);
  });
  
  var EvilBoss;
  it("can add static properties via the `Class.statics()` function", function () {
    EvilBoss = Person.extend({
      initialize: function () { this.supr.apply(this, arguments); }
    }).statics({
      hasPointyHair: true
      , doingWhatRightNow: function () {
        return "nothing good";
      }
    });
    
    expect(EvilBoss.doingWhatRightNow()).toEqual("nothing good");
    expect(EvilBoss.hasPointyHair).toEqual(true);
  });
  
  it("has static properties that can call `this.supr` to call the function of the same name on the parent class", function () {
    var BossOfEvilBoss = EvilBoss.extend({
      initialize: function () { this.supr.apply(this, arguments); }
    }).statics({
      doingWhatRightNow: function () {
        return this.supr();
      }
    });
    
    expect(BossOfEvilBoss.doingWhatRightNow()).toEqual(EvilBoss.doingWhatRightNow());
  });
  
  it("can use `this.mixin` or `this.include` to mixin values at run time", function () {
    var Animal = Class.define({
      initialize: function (config) {
        // See mixer tests for more on this.
        this.include(mixer(config));
      }
    });
    
    var sammy = new Animal({name: "Sammy", type: "horse"});
    expect(sammy.name).toEqual("Sammy");
    expect(sammy.type).toEqual("horse");
  });
});

describe("`mixer`", function () {
  var obj = {};
  it("can turn a function into a mixer", function () {
    var aMixer = mixer(function () {
      this.a = 'a';
      this.b = 'b';
      this.c = 'c';
    });
    
    expect(typeof aMixer.mixTo === "function").toEqual(true);
    expect(aMixer.mixTo(obj).a).toEqual("a");
  });
  
  it("can turn an ordinary object into a mixer", function () {
    var aMixer = mixer(obj);
    
    expect(typeof aMixer.mixTo === "function").toEqual(true);
    expect(aMixer.mixTo({}).a).toEqual("a");
  });
});


