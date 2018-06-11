(function (exports) {
'use strict';

var Handler = function Handler(name, listener, matchListener){
    if ( matchListener === void 0 ) matchListener = null;

    this.name = name;
    this.matchListener = this.listener = listener;
    if(matchListener !== null){
        this.matchListener = matchListener;
    }
};

var MoreEvents = function MoreEvents(context){
    this.listeners = {};
    this.__context = context === void 0 ? this : context;
};
MoreEvents.prototype.addListener = function addListener (name, listener, matchListener){
    if(this.listeners[name] === void 0){
        this.listeners[name] = [];
    }
    this.listeners[name].push(new Handler(name, listener, matchListener));

    return this;
};
MoreEvents.prototype.removeListener = function removeListener (name, listener){
        var this$1 = this;

    if(this.listeners[name] === void 0 || !this.listeners[name].length)
        { return this; }

    for(var i=0; i<this.listeners[name].length; i++){
        var current = this$1.listeners[name][i];
        //The matchListener might be different
        //than the actual listener
        if(current.matchListener === listener){
            this$1.listeners[name].splice(i, 1);
            --i;
        }
    }

    return this;
};
MoreEvents.prototype.emitListeners = function emitListeners (name){
        var this$1 = this;
        var args = [], len = arguments.length - 1;
        while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

    if(this.listeners[name] === void 0 || !this.listeners[name].length) { return; }

    for(var i=0; i<this.listeners[name].length; i++){
        (this$1.listeners[name][i].listener)
        .apply(this$1.__context, args);
    }
    return this;
};
MoreEvents.prototype.removeAll = function removeAll (name){
    delete this.listeners[name];
};
MoreEvents.prototype.dispose = function dispose (){
    this.listeners = this.__context = null;
};

var Emitter = (function (MoreEvents) {
    function Emitter(context){
        MoreEvents.call(this, context);
    }

    if ( MoreEvents ) Emitter.__proto__ = MoreEvents;
    Emitter.prototype = Object.create( MoreEvents && MoreEvents.prototype );
    Emitter.prototype.constructor = Emitter;
    Emitter.prototype.on = function on (name, listener){
        return this.addListener(name, listener);
    };
    Emitter.prototype.off = function off (name, listener){
        return this.removeListener(name, listener);
    };
    Emitter.prototype.one = function one (name, listener){
        return this.on(name, onceListener);
    };
    Emitter.prototype.emit = function emit (name){
        var args = [], len = arguments.length - 1;
        while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

        return (ref = this).emitListeners.apply(ref, [ name ].concat( args ));
        var ref;
    };
    Emitter.prototype.clear = function clear (name){
        this.removeAll(name);
    };

    return Emitter;
}(MoreEvents));

exports.Emitter = Emitter;

}((this.moreEvents = this.moreEvents || {})));
//# sourceMappingURL=more-events.js.map
