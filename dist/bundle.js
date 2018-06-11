'use strict';

var moreEvents = require('more-events');

var now = Date.now ? Date.now : function (){ return new Date().getTime(); };

var TimerChain = (function (Emitter) {
    function TimerChain(list, ref){
        var this$1 = this;
        if ( list === void 0 ) list = [];
        if ( ref === void 0 ) ref = {};
        var sync = ref.sync; if ( sync === void 0 ) sync = true;

        Emitter.call(this);

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

    if ( Emitter ) TimerChain.__proto__ = Emitter;
    TimerChain.prototype = Object.create( Emitter && Emitter.prototype );
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
}(moreEvents.Emitter));

module.exports = TimerChain;
//# sourceMappingURL=bundle.js.map
