/*
Copyright (c) 2011 Paul Harper

MIT Licensed:
Permission is hereby granted, free of charge, to any person obtaining a copy of 
this software and associated documentation files (the "Software"), to deal in 
the Software without restriction, including without limitation the rights to 
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies 
of the Software, and to permit persons to whom the Software is furnished to do 
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all 
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS 
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR 
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER 
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN 
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/// ##Introduction
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
var global;(function(){var a,b,c;"use strict",typeof global=="undefined"&&(global=this),a=this,b=Object.prototype.hasOwnProperty,c=function(a){return Function.prototype.bind?c=Function.prototype.bind:c=function(a){if(typeof this!="function")throw new TypeError("Function.prototype.bind - what is trying to be fBound is not callable");var b=Array.prototype.slice.call(arguments,1),c=this,d=function(){},e=function(){return c.apply(this instanceof d?this:a||window,b.concat(Array.prototype.slice.call(arguments)))};return d.prototype=this.prototype,e.prototype=new d,e},c.call(this,a)},this.Class=function(){function e(){}function f(a){return a.isClass?!0:!1}function g(a){var b,c=a.noInit;return a.noInit=d,b=new a,a.noInit==null?delete a.noInit:a.noInit=c,b}function h(a,c){var d,f;for(d in a){if(!b.call(a,d))continue;f=a[d],typeof f=="function"?e.prototype.defineMethod.call(c,d,f):c[d]=f}return c}function i(a,c){function g(a,b){return a!==e?b==="Parent":b==="define"||b==="def"||b==="simple"}var d,f;for(d in a){if(!b.call(a,d))continue;if(g(a,d))continue;f=a[d],typeof f=="function"?c[d]=k(c.Parent,d,f):c[d]=a[d]}}function j(a){return typeof a=="function"?a():a}function k(a,b,d){return function(){var e,f=this.supr,g=a[b];return typeof g=="function"?this.supr=c.call(g,this):delete this.supr,e=d.apply(this,arguments),f==null?delete this.supr:this.supr=f,e}}var d;return d={noInit:!0},e.def=e.define=function(a,b){function c(){if(this===global)throw new TypeError("Class scope cannot be global scope. You must instantiate with `new`.");this instanceof e||e.mixTo(this.constructor.prototype),c.noInit!==d&&typeof this.initialize=="function"&&this.initialize.apply(this,arguments)}arguments.length<2&&(b=a,a=null);if(!b)throw"No child prototype defined.";return a||(a=e),b=j(b),c.prototype=g(a),c.prototype.constructor=c,c.prototype.__super__=a,h(b,c.prototype),c.Parent=a,i(a,c),f(c)||i(e,c),c},e.isClass=!0,e.extend=function(a){return e.define(this,a)},e.simple=e.extend,e.mixTo=function(b,c){var d;return this.mixer||(this.mixer=a.mixer(this.prototype)),d=b.constructor,this.mixer.mixTo(b),b.constructor=d,c&&i(this,d),b},e.singleton=function(){var a=g(this);return typeof a.initialize=="function"&&a.initialize.apply(a,arguments),a},e.implement=function(a){return a=j(a),h(a,this.prototype),this},e.statics=function(a){return a=j(a),i(a,this),this},e.prototype.method=e.prototype.defineMethod=e.prototype.defMethod=function(a,b){return this[a]=k(this.__super__.prototype,a,b),this},e.prototype.bind=function(a){return c.call(a,this)},e.prototype.mixin=e.prototype.include=function(a){return a.mixTo(this.constructor.prototype,!0)},e}(),this.mixer=function(){function a(a){var e,f;return typeof a=="function"?(f=void 0,e=function(){a.apply(this,arguments)}):(f=a,e=function(){var a;for(a in f){if(!b.call(f,a))continue;this[a]=f[a]}}),e.mixTo=c.call(d,e),e}function d(a){var b=Array.prototype.slice.call(arguments,1);return this.apply(a,b),a}return a}()}).call(this)