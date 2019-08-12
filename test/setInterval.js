import { createContext, patch, unpatch } from '../src/context';
import { expect } from 'chai';

const nativeSetTimeout = global.setTimeout;

describe('createContext', () => {
  describe('patch setInterval', () => {
    before(patch);
    after(unpatch);

    it('should run the context', (done) => {
      const context = createContext();
      context.run(() => {
        const id = setInterval(() => {
          clearInterval(id);
          done();
        }, 60);
      });
    });
  });
});
