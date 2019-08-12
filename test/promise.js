import { createContext, getCurrentContext, resetContexts, patch, unpatch } from '../src/context';
import { expect } from 'chai';

describe('createContext', () => {
  describe('Promise', () => {
    before(() => {
      patch()
    });
    after(() => {
      expect(getCurrentContext()).to.be.null;
      unpatch()
    });

    it('should work with Promise', done => {
      resetContexts()
      const ctx = createContext();
      ctx.run(() => {
        const promise = new Promise((resolve) => {
          setTimeout(() => {
            resolve(42);
          }, 10)
        });

        promise.then(value => {
          expect(value).to.equal(42);
          expect(getCurrentContext()).not.null;
          done()
        }).catch(done);
      });
    });

    it('should work with Promise.resolve', done => {
      const ctx = createContext();
      ctx.run(() => {
        let promise = Promise.resolve(42)
        promise.then(value => {
          expect(getCurrentContext()).not.null;
          done()
        }).catch(done);
      });
    });

    it('should work with await', done => {
      const ctx = createContext();
      ctx.run(async function () {
        try {
          let p = await Promise.resolve(123)
          expect(getCurrentContext()).not.null;
          done()
        } catch (e) {
          done(e)
        }
      });
    });

    it('should work correctly with then', done => {
      resetContexts()
      const p = new Promise((resolve, reject) => {
        const ctx = createContext();
        ctx.run(() => {
          let promise = Promise.resolve(42)
          promise.then(value => {
            expect(getCurrentContext()).not.null;
            resolve(24)
          }).catch(reject);
        });
      });
      p.then(value => {
        expect(getCurrentContext()).to.be.null;
        done()
      }).catch(done);
    });

    it('should work correctly with catch', done => {
      resetContexts()
      const p = new Promise((resolve, reject) => {
        const ctx = createContext();
        ctx.run(() => {
          let promise = Promise.resolve(42)
          promise.then(value => {
            expect(getCurrentContext()).not.null;
            throw new Error("42")
          }).catch(() => {
            expect(getCurrentContext()).not.null;
            resolve()
          }).catch(done);
        });
      });
      p.then(value => {
        expect(getCurrentContext()).to.be.null;
        done()
      }).catch(done);
    });

    it('should work correctly with finally', done => {
      resetContexts()
      const p = new Promise((resolve, reject) => {
        const ctx = createContext();
        ctx.run(() => {
          let promise = Promise.resolve(42)
          promise.then(value => {
            expect(getCurrentContext()).not.null;
          }).finally(()=>{
            expect(getCurrentContext()).not.null;
            resolve()
          }).catch(done);
        });
      });
      p.then(value => {
        expect(getCurrentContext()).to.be.null;
        done()
      }).catch(done);
    });
  });
});
