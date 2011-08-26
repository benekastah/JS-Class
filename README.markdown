#JS-Class

---

Please visit [the documentation](http://benekastah.github.com/JS-Class/ "The documentation") 
or the [the unit tests](https://github.com/benekastah/JS-Class/blob/master/test/spec/javascripts/classSpec.js "Class Unit Tests")
(you know -- for examples).

My implementation is just an enhanced version of the typical javascript class patterns we were all taught in javascript
school:

```
function Thing() {}

function Animal(type) {
  // stuff to initialize each instance here
  this.type = type;
}

Animal.prototype = new Thing();
Animal.prototype.constructor = Animal;
Animal.prototype.howl = function () { return this.type + " did a howl!!"; };
// etc.
```

But instead, you would write something more like this:

```
var Thing = Class.define({});

var Animal = Thing.extend({
  initialize: function (type) {
    // stuff to initialize each instance here
    this.type = type;
  } , howl: function () { return this.type + " did a howl!!"; }
});
```

You can see how building classes would be more pleasant in the second example. You should achieve similar
performance with both approaches, as well. Look at the docs linked above to find out other goodies.

This project has no dependencies. If you just want to get a quick download, **all you need is `class.zip` from the Downloads area**.
If that doesn't work for you, then you can find the minified source file in `build/class.js` (or `build/class.min.js`),
and you can get the non-minified version in `src/class.js`.

Happy classing!

##Short (soon to be longer) list of javascript class implementations/ideas
  * [klass](http://www.dustindiaz.com/klass)
  * [simple javascript inheritance](http://ejohn.org/blog/simple-javascript-inheritance/) from John Resig
  * [Douglas Crockford's notes](http://www.crockford.com/javascript/inheritance.html)
  * [Prototype's class](http://www.prototypejs.org/api/class)
  * [Mootools' class](http://mootools.net/docs/core/Class/Class)
  * [Prototypal Inheritance](http://howtonode.org/prototypical-inheritance)

Please contact me with links that can be added to the above.