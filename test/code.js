(function () {
    'use strict';

    //Most for use with gyre
    /*
    git remote add origin https://github.com/hollowdoor/more_events.git
    git push -u origin master
    */
    function MoreEvents(context){
        this.listeners = {};
        this.__context = context || this;
    }

    MoreEvents.prototype = {
        constructor: MoreEvents,
        on: function(event, listener){
            this.listeners[event] = this.listeners[event] || [];
            this.listeners[event].push(listener);
            return this;
        },
        one: function(event, listener){
            function onceListener(){
                listener.apply(this, arguments);
                this.off(event, onceListener);
                return this;
            }
            return this.on(event, onceListener);
        },
        emit: function(event){
            var this$1 = this;

            if(typeof this.listeners[event] === 'undefined' || !this.listeners[event].length)
                { return this; }

            var args = Array.prototype.slice.call(arguments, 1),
                canRun = this.listeners[event].length;

            do{
                this$1.listeners[event][--canRun].apply(this$1.__context, args);
            }while(canRun);

            return this;
        },
        off: function(event, listener){
            if(this.listeners[event] === undefined || !this.listeners[event].length)
                { return this; }
            this.listeners[event] = this.listeners[event].filter(function(item){
                return item !== listener;
            });
            return this;
        },
        dispose: function(){
            var this$1 = this;

            for(var n in this$1){
                this$1[n] = null;
            }
        }
    };

    var Emitter = MoreEvents;

    var getNow = Date.now !== void 0
    ? Date.now
    : function (){ return new Date().getTime(); };

    var makeNow = function (highres){
        if(!highres) { return getNow; }

        var bind = !Function.prototype.bind
        ? function (f, c){ return function (){
            var arguments$1 = arguments;

            var a = [], len = arguments.length;
            while ( len-- ) { a[ len ] = arguments$1[ len ]; }

            return f.apply(c, a);
     }        }
        : function (f, c){ return f.bind(c); };

        var perfNow = bind((function() {
          return performance.now       ||
                 performance.mozNow    ||
                 performance.msNow     ||
                 performance.oNow      ||
                 performance.webkitNow ||
                 function() { return getNow(); };
        })(), performance);

        var navstart = performance.timing.navigationStart;

        return function (){
            return navstart + perfNow();
        };
    };



    var Timer = (function (Emitter$$1) {
        function Timer(interval, ref){
            var this$1 = this;
            if ( interval === void 0 ) { interval = 1000; }
            if ( ref === void 0 ) { ref = {}; }
            var sync = ref.sync; if ( sync === void 0 ) { sync = 1000; }
            var tick = ref.tick; if ( tick === void 0 ) { tick = null; }
            var highres = ref.highres; if ( highres === void 0 ) { highres = false; }
            var skip = ref.skip; if ( skip === void 0 ) { skip = true; }


            Emitter$$1.call(this);

            var now = makeNow(highres);

            var timeoutId = null,
                running = false,
                paused = false,
                count = 0,
                timeRange = Infinity,
                startTime = now(),
                pauseCount = 0,
                pauseLimit = Infinity;


            if(typeof tick === 'function'){
                this.on('tick', tick);
            }

            Object.defineProperties(this, {
                interval: {get: function get(){ return interval; }},
                paused: {get: function get(){ return paused; }},
                running: {get: function get(){ return running; }},
                count: {get: function get(){ return count; }},
                percent: {get: function get(){
                    return ~~((count - pauseCount * interval / interval) / (timeRange / interval) * 100 + 0.5);
                }},
                startTime: {get: function get(){ return startTime; }}
            });

            var interrupt = function (){
                clearTimeout(timeoutId);
                timeoutId = null;
                running = false;
            };

            var ready = function (startTime, next, mil){
                paused = false;
                running = true;
                timeoutId = setTimeout(next, mil);
                this$1.emit('start', startTime);
            };

            var next = function (){
                if(!running) { return; }

                var time = now();
                //The less accurate diffing
                //var diff = (time - startTime) % interval;
                var diff = (time - startTime) - (++count * interval);

                time = time - diff;

                var passed = (time - startTime) - pauseCount * interval;

                timeoutId = setTimeout(next, interval - diff);

                if(!paused){
                    this$1.emit('tick', time, passed, diff);
                }else{
                    ++pauseCount;
                    if((pauseCount + 1) * interval > pauseLimit){
                        this$1.start();
                    }
                }

                if(time > startTime + timeRange + pauseCount * interval){
                    this$1.emit('complete', time, passed);
                    this$1.stop();
                }
            };

            function stop(){
                count = 0;
                paused = false;
                pauseCount = 0;
                startTime = null;
                interrupt();
                this.emit('stop');
                return this;
            }

            function pause(limit){
                if ( limit === void 0 ) { limit = Infinity; }

                paused = true;
                pauseLimit = limit;
                this.emit('pause');
                return this;
            }

            function range(r){
                if(r === undefined){
                    return timeRange;
                }
                timeRange = r;
                return this;
            }

            function start(wait){
                if ( wait === void 0 ) { wait = 0; }

                var i = interval;

                if(!paused && running){
                    return this;
                }

                if(wait){
                    i = wait;

                    if(!paused){
                        startTime = now();

                        if(sync){
                            var diff = startTime % sync;
                            var round = wait < interval
                            ? 0 : interval;

                            startTime = startTime - diff + round;
                        }
                    }
                }else if(!paused){
                    startTime = now();

                    if(sync){
                        var diff$1 = startTime % sync;
                        var round$1 = diff$1 < interval / 2
                        ? 0 : interval;

                        startTime = startTime - diff$1 + round$1;

                        i = diff$1 + round$1;
                    }
                }

                ready(startTime, next, i);
                return this;
            }

            /*function start(wait = 0){

                if(!paused){
                    startTime = now();
                }

                if(sync){
                    let original = startTime;
                    let startInterval = wait ? wait : interval;



                    if(!paused){
                        let diff = startTime % sync;
                        startTime = startTime - diff + wait;
                        startInterval = wait
                        ? wait
                        : interval - diff + interval;
                    }

                    console.log('original ',original)
                    console.log('startTime ',startTime)
                    console.log('startInterval ',startInterval)

                    ready(startTime, next, startInterval);
                    return this;
                }

                ready(startTime, next, interval + wait);
                return this;
            }*/

            this.stop = stop;
            this.pause = pause;
            this.range = range;
            this.start = start;
        }

        if ( Emitter$$1 ) { Timer.__proto__ = Emitter$$1; }
        Timer.prototype = Object.create( Emitter$$1 && Emitter$$1.prototype );
        Timer.prototype.constructor = Timer;
        Timer.prototype.dispose = function dispose (){
            var this$1 = this;

            Emitter$$1.prototype.dispose.call(this);
            Object.keys(this).forEach(function (key){
                try{
                    delete this$1[key];
                }catch(e){}
            });
        };

        return Timer;
    }(Emitter));

    Timer.create = function (interval, options){
        return new Timer(interval, options);
    };

    Timer.now = getNow;

    var Handler = function Handler(name, listener, matchListener){
        if ( matchListener === void 0 ) { matchListener = null; }

        this.name = name;
        this.matchListener = this.listener = listener;
        if(matchListener !== null){
            this.matchListener = matchListener;
        }
    };

    var MoreEvents$1 = function MoreEvents(context){
        this.listeners = {};
        this.__context = context === void 0 ? this : context;
    };
    MoreEvents$1.prototype.addListener = function addListener (name, listener, matchListener){
        if(this.listeners[name] === void 0){
            this.listeners[name] = [];
        }
        this.listeners[name].push(new Handler(name, listener, matchListener));

        return this;
    };
    MoreEvents$1.prototype.removeListener = function removeListener (name, listener){
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
    MoreEvents$1.prototype.emitListeners = function emitListeners (name){
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
    MoreEvents$1.prototype.removeAll = function removeAll (name){
        delete this.listeners[name];
    };
    MoreEvents$1.prototype.dispose = function dispose (){
        this.listeners = this.__context = null;
    };

    var Emitter$1 = (function (MoreEvents) {
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
    }(MoreEvents$1));

    var now = Date.now ? Date.now : function (){ return new Date().getTime(); };

    var TimerChain = (function (Emitter$$1) {
        function TimerChain(list, ref){
            var this$1 = this;
            if ( list === void 0 ) { list = []; }
            if ( ref === void 0 ) { ref = {}; }
            var sync = ref.sync; if ( sync === void 0 ) { sync = true; }

            Emitter$$1.call(this);

            var current = list[0];

            this.list = list;
            this.index = 0;
            this.synchronize = sync;

            Object.defineProperty(this, 'current', {
                get: function get(){ return current; }
            });

            var onTick = function (){
                var arguments$1 = arguments;

                var ref;

                var args = [], len = arguments.length;
                while ( len-- ) { args[ len ] = arguments$1[ len ]; }
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

        if ( Emitter$$1 ) { TimerChain.__proto__ = Emitter$$1; }
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
    }(Emitter$1));

    var eachStart = function (){
        console.log('started');
    };
    var chain = new TimerChain([
        new Timer(1000).range(3000).on('start', eachStart),
        new Timer(1000).range(5000).on('start', eachStart),
        new Timer(1000).range(3000).on('start', eachStart)
    ]);

    chain.on('tick', function (time, passed){
        console.log(new Date(time));
    });

    chain.start();

}());
//# sourceMappingURL=code.js.map
