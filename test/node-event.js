import { expect, assert } from 'chai';
import { once } from 'lodash';
import http from 'http';
import EventEmitter from 'events';
import { spy } from 'sinon';

import { withContext, createContext, getCurrentContext, patch, unpatch } from '../src/context';

const nativeSetTimeout = global.setTimeout;

describe('createContext', () => {
  describe('patch nodejs events', () => {
    before(patch);
    after(unpatch);

    it('should pass event data correctly', () => {
      const ctx = createContext();
      const eventEmitter = new EventEmitter;
      const eventSpy = spy();
      ctx.run(() => {
        eventEmitter.on('awesome_event', eventSpy);
      });
      const params = [
        [1, 'a', {}],
        [2, () => {}, /a/],
      ]
      eventEmitter.emit('awesome_event', ...params[0]);
      eventEmitter.emit('awesome_event', ...params[1]);

      expect(eventSpy.callCount).to.equal(2);
      assert(eventSpy.firstCall.calledWith(...params[0]));
      assert(eventSpy.secondCall.calledWith(...params[1]));
    });

    it('should list original listeners', () => {
      const ctx = createContext();
      const eventEmitter = new EventEmitter;
      const listeners = [
        () => 1,
        () => 2,
        () => 3,
      ];

      eventEmitter.on('awesome_event', listeners[0]);
      ctx.run(() => {
        eventEmitter.on('awesome_event', listeners[1]);
        eventEmitter.on('awesome_event', listeners[2]);
      });

      const actual = eventEmitter.listeners('awesome_event');
      expect(actual).deep.equal(listeners);
    });

    it('should remove listener correctly', () => {
      const listener = () => 1;
      const ctx = createContext();
      const eventEmitter = new EventEmitter;

      ctx.run(() => {
        eventEmitter.on('awesome_event', listener);
      });

      expect(eventEmitter.listenerCount('awesome_event')).equal(1);
      eventEmitter.removeListener('awesome_event', listener);
      expect(eventEmitter.listenerCount('awesome_event')).equal(0);
    });

    it('http server test', (done) => {
      const doneOnce = once(done);
      const fail = label => () => doneOnce(new Error(label));
      const responsesSpy = spy();

      const naiveFunction = (method, cb) => {
        setTimeout(() => {
          const ctx = getCurrentContext();
          cb(`${method} ${ctx.getState().someValue}`);
        }, 10);
      }

      const requestHandler = withContext((req, res) => {
        const ctx = getCurrentContext();
        ctx.getState().someValue = '/echo';
        naiveFunction(req.method, responsesSpy);
      })

      const server = http.createServer(requestHandler);

      server.emit('request', { method: 'GET' });
      server.emit('request', { method: 'POST' });
      setTimeout(() => {
        expect(responsesSpy.callCount).to.equal(2);
        assert.ok(responsesSpy.firstCall.calledWith('GET /echo'));
        assert.ok(responsesSpy.secondCall.calledWith('POST /echo'));
        done();
      }, 20);
    });
  });
});
