import { createContext, patch, unpatch } from '../src/context';
import { expect } from 'chai';

const nativeSetTimeout = global.setTimeout;

describe('createContext', () => {
  describe('patch setTimeout', () => {
    before(patch);
    after(unpatch);

    it('should run the context', (done) => {
      const context = createContext();
      context.run(() => setTimeout(done, 60));
    });
  });
});
