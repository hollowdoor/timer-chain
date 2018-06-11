timer-chain
====

Install
----

`npm install timer-chain`

Usage
---

`timer-chain` is meant to be used with horologe, but could potentially be used with any object that is an event emitter with a `tick` event, has pause, stop, and start instance methods, and an `interval` instance property. If the `start` method has a `wait` argument as it's first argument that also helps.

```javascript
import Timer from 'horologe';
import TimerChain from 'timer-chain';

const eachStart = ()=>{
    console.log('started');
};
let chain = new TimerChain([
    new Timer(1000).range(3000).on('start', eachStart),
    new Timer(1000).range(5000).on('start', eachStart),
    new Timer(1000).range(3000).on('start', eachStart)
]);

chain.on('tick', (time, passed)=>{
    //When the current timer ticks
    //the timer chain ticks.
    console.log(new Date(time));
});

chain.start();

```

Properties
----

Methods
----

### chain.start()

### chain.stop()

### chain.pause()

### chain.on(event, callback)

Events
---

### chain.on('tick', callback)

The callback is called on each interval.

```javascript
chain.on('tick', (...args)=>{
    //Fired every interval
});
```

### chain.on('start', callback)

### chain.on('pause', callback)

### chain.on('stop', callback)

About
---

Chain timers in order.
