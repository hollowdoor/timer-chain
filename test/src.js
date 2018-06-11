import Timer from 'horologe';
import TimerChain from '../';

const eachStart = ()=>{
    console.log('started');
};
let chain = new TimerChain([
    new Timer(1000).range(3000).on('start', eachStart),
    new Timer(1000).range(5000).on('start', eachStart),
    new Timer(1000).range(3000).on('start', eachStart)
]);

chain.on('tick', (time, passed)=>{
    console.log(new Date(time));
});

chain.start();
