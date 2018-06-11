class Handler {
    constructor(name, listener, matchListener = null){
        this.name = name;
        this.matchListener = this.listener = listener;
        if(matchListener !== null){
            this.matchListener = matchListener;
        }
    }
}

class MoreEvents {
    constructor(context){
        this.listeners = {};
        this.__context = context === void 0 ? this : context;
    }
    addListener(name, listener, matchListener){
        if(this.listeners[name] === void 0){
            this.listeners[name] = [];
        }
        this.listeners[name].push(new Handler(name, listener, matchListener));

        return this;
    }
    removeListener(name, listener){
        if(this.listeners[name] === void 0 || !this.listeners[name].length)
            return this;

        for(let i=0; i<this.listeners[name].length; i++){
            let current = this.listeners[name][i];
            //The matchListener might be different
            //than the actual listener
            if(current.matchListener === listener){
                this.listeners[name].splice(i, 1);
                --i;
            }
        }

        return this;
    }
    emitListeners(name, ...args){
        if(this.listeners[name] === void 0 || !this.listeners[name].length) return;

        for(let i=0; i<this.listeners[name].length; i++){
            (this.listeners[name][i].listener)
            .apply(this.__context, args);
        }
        return this;
    }
    removeAll(name){
        delete this.listeners[name];
    }
    dispose(){
        this.listeners = this.__context = null;
    }
}

class Emitter extends MoreEvents {
    constructor(context){
        super(context);
    }
    on(name, listener){
        return this.addListener(name, listener);
    }
    off(name, listener){
        return this.removeListener(name, listener);
    }
    one(name, listener){
        function once(){
            listener.apply(this, arguments);
            return this.off(name, once);
        }
        return this.on(name, onceListener);
    }
    emit(name, ...args){
        return this.emitListeners(name, ...args);
    }
    clear(name){
        this.removeAll(name);
    }
}


export { Emitter };
