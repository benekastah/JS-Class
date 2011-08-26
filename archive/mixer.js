this.Mixer = function (item) {
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
            
            if (this instanceof Class && item !== object) {
                var constructor = this.constructor;
                for (property in item) {
                    if (!hasProperty.call(item, property)) continue;
                    constructor[property] = item[property];
                }
            }
        };
    }
    
    ret.mixTo = bind.call(Mixer.mixTo, ret);
    
    return ret;
};

Mixer.mixTo = function (receiver) {
    var config = Array.prototype.slice.call(arguments, 1);
    this.apply(receiver, config);
    return receiver;
};