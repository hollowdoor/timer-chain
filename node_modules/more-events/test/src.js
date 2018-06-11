import { Emitter } from '../';

const events = new Emitter();

events.on('thing', data=>{
    console.log('thing ', data);
});

events.emit('thing', 'do something');

function thing(arg){
    console.log(arg);
}
events.on('thing1', thing);
events.emit('thing1', 'something');
events.off('thing1', thing);
events.emit('thing1', 'something');
