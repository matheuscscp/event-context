import { expect } from 'chai';
import { createContext, getCurrentContext, patch, unpatch } from '../src/context';

const nativeSetTimeout = global.setTimeout;

describe('createContext', () => {
  describe('patch process.nextTick', () => {
    before(patch);
    after(unpatch);

    it('should run the context', (done) => {
      const context = createContext();
      context.run(() => {
        const id = process.nextTick(() => {
          done();
        });
      });
    });
  });
});
