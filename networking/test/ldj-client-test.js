const assert = require('assert');
const EventEmitter = require('events').EventEmitter;
const LDJClient = require('../lib/ldj-client');

describe('LDJClient', () => {
  let stream = null;
  let client = null;

  beforeEach(() => {
    stream = new EventEmitter();
    client = new LDJClient(stream);
  });

  it('should emit a message event from a single data event', done => {
    client.on('message', message => {
      assert.deepEqual(message, {foo: 'bar'});
      done();
    });
    stream.emit('data', '{"foo":"bar"}\n');
  });

  it('should emit a message event from split data events', done => {
    client.on('message', message => {
      assert.deepEqual(message, {foo: 'bar'});
      done();
    });
    stream.emit('data', '{"foo":');
    process.nextTick(() => stream.emit('data', '"bar"}\n'));
  });

  it('should throw error when passing in null stream', () => {
    assert.throws(() => client = new LDJClient(null), Error);
  });

  it('should emit error event from non-JSON message', done => {
    client.on('error', err => {
      assert.notEqual(err, null);
      done();
    });
    stream.emit('data', 'non-json\n');
  });

  it('should emit close event from message without newline', done => {
    client.on('message', message => {
      assert.deepEqual(message, {foo: 'bar'});
    });
    client.on('close', () => {
      done();
    });
    stream.emit('data', '{"foo":"bar"}');
    process.nextTick(() => stream.emit('close'));
  })
});