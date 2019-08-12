import { createHook, executionAsyncId } from 'async_hooks';

let contextsIds = {};
let patched = false;
let counter = 0;

const hook = createHook({
  init(asyncId, type, triggerAsyncId) {
    const tarray = contextsIds[triggerAsyncId]
    if (!tarray) return;
    const tctx = tarray[tarray.length-1]
    if (tctx) {
      const newE = Object.assign({}, tctx)
      newE.parent = tctx
      contextsIds[asyncId] = [newE]
    }
  },
  destroy(asyncId) {
    delete contextsIds[asyncId]
  }
})

export const unpatch = () => {
  patched = false;
  hook.disable()
};

export const patch = () => {
  if (patched) {
    console.warn(`Cannot call patch() for promise twice`);
    return;
  }
  patched = true;
  hook.enable()
  return unpatch;
}

export const getCurrentContext = () => {
  const ctxArray = contextsIds[executionAsyncId()]
  if (!ctxArray) return null;
  return ctxArray[ctxArray.length-1];
}
export const setCurrentContext = ctx => {
  const executionId = executionAsyncId()
  if (!contextsIds[executionId]) {
    contextsIds[executionId] = [ctx]
  } else {
    contextsIds[executionId].push(ctx)
  }
}
export const revertContext = () => {
  contextsIds[executionAsyncId()].pop()
}
export const resetContexts = () => {
  contextsIds = {}
}

export const p = () => {
  return contextsIds
}

export const createContext = (label) => {
  const ctx = {};
  let hasRun = false;
  let state = {};
  if (!label) label = counter;
  counter++;

  const run = (computation) => {
    if (hasRun) {
      throw new Error('Each context can only run once');
    }

    hasRun = true;
    ctx.parent = getCurrentContext();

    // inherit states
    if (ctx.parent) {
      const parentState = Object.create(ctx.parent.getState());
      state = Object.assign(parentState, state);
    }

    ctx.toString = () => {
      if (!ctx.parent) return `[${label}]`;
      else return ctx.parent.toString()+`[${label}]`;
    }
    ctx.name = ctx.toString()

    setCurrentContext(ctx);
    try {
      return computation();
    }
    finally {
      revertContext()
    }
  }

  // public API
  ctx.run = run;
  ctx.getState = () => state
  ctx.toString = () => {
    return `[.${label}.]`;
  }
  return ctx;
}

export const withContext = fn => function (...params) {
  const ctx = createContext();
  return ctx.run(() => fn.apply(this, params));
}
