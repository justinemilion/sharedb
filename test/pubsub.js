var expect = require('expect.js');

module.exports = function(create) {
  describe('pubsub', function() {
    beforeEach(function(done) {
      var self = this;
      create(function(err, pubsub) {
        if (err) throw err;
        self.pubsub = pubsub;
        done();
      });
    });

    afterEach(function(done) {
      this.pubsub.close(done);
    });

    it('can subscribe to a channel', function(done) {
      var pubsub = this.pubsub;
      pubsub.subscribe('x', function(err, stream) {
        if (err) throw err;
        stream.on('data', function(data) {
          expect(data).eql({test: true});
          done();
        });
        expect(pubsub.streamsCount).equal(1);
        pubsub.publish(['x'], {test: true});
      });
    });

    it('publish optional callback waits', function(done) {
      var pubsub = this.pubsub;
      pubsub.subscribe('x', function(err, stream) {
        if (err) throw err;
        var emitted;
        stream.on('data', function(data) {
          emitted = data;
        });
        pubsub.publish(['x'], {test: true}, function(err) {
          if (err) throw err;
          expect(emitted).eql({test: true});
          done();
        });
      });
    });

    it('can subscribe to a channel twice', function(done) {
      var pubsub = this.pubsub;
      pubsub.subscribe('y', function(err, stream) {
        pubsub.subscribe('y', function(err, stream) {
          if (err) throw err;
          var emitted;
          stream.on('data', function(data) {
            expect(data).eql({test: true});
            done();
          });
          expect(pubsub.streamsCount).equal(2);
          pubsub.publish(['x', 'y'], {test: true});
        });
      });
    });

    it('stream.destroy() unsubscribes from a channel', function(done) {
      var pubsub = this.pubsub;
      pubsub.subscribe('x', function(err, stream) {
        if (err) throw err;
        expect(pubsub.streamsCount).equal(1);
        stream.on('data', function() {
          // Will error if done is called twice
          done();
        });
        stream.destroy();
        expect(pubsub.streamsCount).equal(0);
        pubsub.publish(['x', 'y'], {test: true});
        done();
      });
    });
  });
};