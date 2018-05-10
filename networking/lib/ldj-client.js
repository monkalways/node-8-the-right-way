const EventEmitter = require('events').EventEmitter;

class LDJClient extends EventEmitter {
  constructor(stream) {
    super();

    let buffer = '';
    stream.on('data', data => {
      buffer += data;
      let boundary = buffer.indexOf('\n');
      while(boundary !== -1) {
        const input = buffer.substring(0, boundary);
        buffer = buffer.substring(boundary + 1);
        let message;
        try {
          message = JSON.parse(input);
        } catch(err) {
          this.emit('error', err);
          return;
        }
        this.emit('message', message);
        boundary = buffer.indexOf('\n');
      }
    });

    stream.on('close', () => {
      let message;
        try {
          message = JSON.parse(buffer);
        } catch(err) {
          this.emit('error', err);
          return;
        }
        this.emit('message', message);
        process.nextTick(() => this.emit('close'));
    });
  }

  static connect(stream) {
    return new LDJClient(stream);
  }
}

module.exports = LDJClient;