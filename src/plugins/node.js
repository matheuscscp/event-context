import EventEmitter from 'events';
import { getCurrentContext, setCurrentContext, revertContext } from 'event-context';

const computationMap = new WeakMap;
const listenerMap = new WeakMap;
const nextTick = process.nextTick;
const proto = EventEmitter.prototype;
const eEmit = proto.emit;
const eAddListener = proto.addListener;
const ePrependListener = proto.prependListener;
const eRemoveListener = proto.removeListener;
const eListeners = proto.listeners;
const noop = () => {}

export const patch = () => {
  process.nextTick = (callback, ...rest) => {
    const ctx = getCurrentContext();
    if (!ctx) {
      return nextTick(callback, ...rest);
    }

    if (callback.__test === true) {
      console.log(ctx.label);
    }

    const computation = (...args) => {
      setCurrentContext(ctx);
      try {
        callback(...args);
      }
      finally {
        revertContext();
      }
    }

    nextTick(computation, ...rest)
  }

  const wrap = nativeAddFunction => function (type, handler) {
    const ctx = getCurrentContext();
    if (!ctx) {
      return nativeAddFunction.call(this, type, handler);
    }

    const computation = (...args) => {
      setCurrentContext(ctx);
      try {
        return handler.call(this, ...args);
      }
      finally {
        revertContext();
      }
    }

    computationMap.set(handler, computation);
    listenerMap.set(computation, handler);
    const dispose = () => {
      eRemoveListener.call(this, type, computation);
      computationMap.delete(handler);
    }

    ctx.addDisposable(dispose);
    return nativeAddFunction.call(this, type, computation);
  }


  proto.addListener = proto.on = wrap(eAddListener);
  proto.prependListener = wrap(ePrependListener);

  proto.listeners = function (type) {
    const listeners = eListeners.call(this, type);
    const original = listeners.map(handler => listenerMap.get(handler) || handler);
    return original;
  }

  proto.removeListener = function (type, listener) {
    const computation = computationMap.get(listener);
    return eRemoveListener.call(this, type, computation || listener);
  }
}

export const unpatch = () => {
  process.nextTick = nextTick;
  proto.addListener = proto.on = eAddListener;
  proto.prependListener = ePrependListener;
  proto.removeListener = eRemoveListener;
}
