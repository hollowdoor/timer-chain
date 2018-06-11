more-events
===========

Install
-------

`npm install more-events`

It's
----

Another event emitter with the usual methods.

-	on
-	off
-	one
-	emit

This is similar to [node's event Emitter](https://nodejs.org/api/events.html), but the emitter in `more-events` is lighter.

### emitter.addListener(name, listener, matchListener)

Set a listener like with `emitter.on()` except `matchListener` will be used to find the listener instead of `listener` for removal.

The default for `matchListener` is null, and if it is null `listener` will be used for removal.

### emitter.clear(name)

Remove all listeners on the given event name using `emitter.clear(name)`.

Other methods/properties to be aware of:
-----------------------------------

* removeListener()
* emitListeners()
* removeAll()

### emitter.listeners

`emitter.listeners` is object where listeners are stored.

Set the context if you want.
----------------------------

```javascript
import { Emitter } from 'more-events';
function MyClass(){
    this.emitter = new Emitter(this /*A different context for listeners*/);
}
```

Otherwise the emitter uses it's own context, or the inherited context (this instance).

```javascript
import { Emitter } from 'more-events';
class MyClass extends Emitter {
    constructor(){
        super(); //Emitter uses this from MyClass
    }
}
```

emitter.dispose()
-----------------

Destroy the object when you don't need it any more. Good for memory management.

Why?
----

Because I can, and because I need a really light emitter I can depend on.
