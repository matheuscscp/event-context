let contexts = [null];

export const getCurrentContext = () => contexts[contexts.length-1];
export const setCurrentContext = ctx => {
  contexts.push(ctx);
}
export const revertContext = () => {
  contexts.pop();
}

export const createContext = (label = 'anonymous') => {
  const ctx = {};
  const disposables = [];
  let hasRun = false;
  let state = {};

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
    setCurrentContext(ctx);

    try {
      computation();
    }
    finally {
      revertContext();
    }
  }

  // public API
  ctx.run = run;
  ctx.addDisposable = (disposable) => disposables.push(disposable);
  ctx.dispose = () => disposables.forEach(fn => fn());
  ctx.getState = () => state
  ctx.toString = () => `[Context ${label}]`;
  return ctx;
}

export const withContext = fn => function (...params) {
  const ctx = createContext();
  return ctx.run(() => {
    fn.apply(this, params);
  });
}
