import {Emitter} from 'more-events';
const now = Date.now ? Date.now : ()=>new Date().getTime();

export default class TimerChain extends Emitter {
    constructor(list = [], {
        sync = true
    } = {}){
        super();

        let current = list[0];

        this.list = list;
        this.index = 0;
        this.synchronize = sync;

        Object.defineProperty(this, 'current', {
            get(){ return current; }
        });

        const onTick = (...args)=>{
            return this.emit('tick', ...args);
        };

        current.on('tick', onTick);

        list.forEach((timer, i)=>{

            if(typeof timer.start !== 'function'){
                throw new Error(`Timer does not have a start method`);
            }

            if(i === list.length - 1){
                timer.on('complete', ()=>{
                    this.emit('complete');
                });
                return;
            }

            timer.on('complete', (time)=>{
                current.off('tick', onTick);
                let present = now();
                current = list[++this.index];
                current.on('tick', onTick);
                let diff = present - time;
                let wait = current.interval - diff;
                current.start(wait);
            });
        });
    }
    start(){
        if(typeof this.current.start !== 'function'){
            throw new Error(`Timer does not have a start method`);
        }
        console.log('this.current ',this.current)
        this.current.start();
        this.emit('start', this.current.startTime || now());
        return this;
    }
    pause(){
        if(typeof this.current.pause !== 'function'){
            throw new Error(`Timer does not have a pause method`);
        }
        this.current.pause();
        this.emit('pause');
        return this;
    }
    stop(){
        if(typeof this.current.stop !== 'function'){
            throw new Error(`Timer does not have a stop method`);
        }
        this.current.stop();
        this.emit('stop');
        return this;
    }
}
