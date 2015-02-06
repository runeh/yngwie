var EventEmitter = require('events').EventEmitter;
var util = require('util');
var stream = require('./eventstream.js');

function UnleashEventSource(url, pollInterval) {
    this._firstEventSeen = false;
    this.stream = stream(url, pollInterval)
        .stopOnError(this.onError.bind(this))
        .each(this.onItem.bind(this));
} 

util.inherits(UnleashEventSource, EventEmitter);

UnleashEventSource.prototype.onItem = function(event) {
    if (!this._firstEventSeen) {
        this.emit("connect", this);
        this._firstEventSeen = true;
    }
    this.emit("event", event);
    this.emit(event.type, event);
}

UnleashEventSource.prototype.onError = function(err) {
    this.emit("error", err);
}

module.exports = UnleashEventSource;
