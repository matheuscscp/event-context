# event-context

- Event context for JavaScript
- Work in both NodeJS and browsers
- No dependencies

## Features

1. automatic state passing to downstream functions without explicitly declaring them in functions' parameters (think of [React's context](https://facebook.github.io/react/docs/context.html) but with inheritance). State values are accessible everywhere with `ctx.getState()`
2. automatic disposal for every pending tasks and event listeners to prevent memory leaks. EventContext works with Promise as well, so you can abort nested unresolved promises with ease. Context disposal is accessible everywhere with `ctx.dispose()`

# event-context-plugin-jquery
Make EventContext package aware of jQuery bindings

## Installation:

```bash
npm i -S tfg-event-context tfg-event-context-plugin-jquery
```

## Usages

### Passing data across functions without declaring them each time.

```js
import { createContext, getCurrentContext } from 'tfg-event-context';
import { patch } from 'tfg-event-context-plugin-jquery';

// patch all jQuery binding after this call
patch();

$(function () {
  function doSth() {
    callSomethingElse();
  }

  function callSomethingElse() {
    const ctx = getCurrentContext();
    console.log('the context data is:', ctx.getState());
    // the above line will print { theMeaningOfLife: 42, x: ..., y: ... } with x, y values will fill in automagically
  }

  // ... some code
  const ctx = createContext();

  $('#awesome-button').click(function (e) {
    ctx.run(() => {
      const state = ctx.getState();
      state.theMeaningOfLife = 42;
      // get the click position
      state.x = e.pageX;
      state.y = e.pageY;

      // you don't need to pass everything here
      doSth();
    });
  });
});

// if you only care about the state, not the context, you can skip createContext step and replace it with
$('#awesome-button').click(withContext(function (e) {
  const ctx = getCurrentContext();
  const state = ctx.getState();
  state.theMeaningOfLife = 42;
  state.x = e.pageX;
  state.y = e.pageY;

  doSth();
}));

```

### Auto unbinding

When you decide to stop all event listeners created in an context, just call `ctx.dispose()`

```js
const ctx = getCurrentContext();
ctx.dispose()
```

All bound event handlers within the context will be removed.

## See also
EventContext for NodeJS https://www.npmjs.com/package/tfg-event-context-plugin-node
