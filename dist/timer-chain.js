var timerChain = (function () {
    'use strict';

    var Handler = function Handler(name, listener, matchListener){
        if ( matchListener === void 0 ) { matchListener = null; }

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
            var arguments$1 = arguments;

            var this$1 = this;
            var args = [], len = arguments.length - 1;
            while ( len-- > 0 ) { args[ len ] = arguments$1[ len + 1 ]; }

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

        if ( MoreEvents ) { Emitter.__proto__ = MoreEvents; }
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
            var arguments$1 = arguments;

            var args = [], len = arguments.length - 1;
            while ( len-- > 0 ) { args[ len ] = arguments$1[ len + 1 ]; }

            return (ref = this).emitListeners.apply(ref, [ name ].concat( args ));
            var ref;
        };
        Emitter.prototype.clear = function clear (name){
            this.removeAll(name);
        };

        return Emitter;
    }(MoreEvents));

    var now = Date.now ? Date.now : function (){ return new Date().getTime(); };

    var TimerChain = (function (Emitter$$1) {
        function TimerChain(list, ref){
            var this$1 = this;
            if ( list === void 0 ) list = [];
            if ( ref === void 0 ) ref = {};
            var sync = ref.sync; if ( sync === void 0 ) sync = true;

            Emitter$$1.call(this);

            var current = list[0];

            this.list = list;
            this.index = 0;
            this.synchronize = sync;

            Object.defineProperty(this, 'current', {
                get: function get(){ return current; }
            });

            var onTick = function (){
                var ref;

                var args = [], len = arguments.length;
                while ( len-- ) args[ len ] = arguments[ len ];
                return (ref = this$1).emit.apply(ref, [ 'tick' ].concat( args ));
            };

            current.on('tick', onTick);

            list.forEach(function (timer, i){

                if(typeof timer.start !== 'function'){
                    throw new Error("Timer does not have a start method");
                }

                if(i === list.length - 1){
                    timer.on('complete', function (){
                        this$1.emit('complete');
                    });
                    return;
                }

                timer.on('complete', function (time){
                    current.off('tick', onTick);
                    var present = now();
                    current = list[++this$1.index];
                    current.on('tick', onTick);
                    var diff = present - time;
                    var wait = current.interval - diff;
                    current.start(wait);
                });
            });
        }

        if ( Emitter$$1 ) TimerChain.__proto__ = Emitter$$1;
        TimerChain.prototype = Object.create( Emitter$$1 && Emitter$$1.prototype );
        TimerChain.prototype.constructor = TimerChain;
        TimerChain.prototype.start = function start (){
            if(typeof this.current.start !== 'function'){
                throw new Error("Timer does not have a start method");
            }
            console.log('this.current ',this.current);
            this.current.start();
            this.emit('start', this.current.startTime || now());
            return this;
        };
        TimerChain.prototype.pause = function pause (){
            if(typeof this.current.pause !== 'function'){
                throw new Error("Timer does not have a pause method");
            }
            this.current.pause();
            this.emit('pause');
            return this;
        };
        TimerChain.prototype.stop = function stop (){
            if(typeof this.current.stop !== 'function'){
                throw new Error("Timer does not have a stop method");
            }
            this.current.stop();
            this.emit('stop');
            return this;
        };

        return TimerChain;
    }(Emitter));

    return TimerChain;

}());
//# sourceMappingURL=timer-chain.js.map
