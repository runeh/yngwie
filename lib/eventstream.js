var request = require('request-promise');
var highland = require('highland');
var promiseToStream = highland;
var arrayToStream = highland;
var pollerToStream = highland;

function seenRecentlyPredicate() {
    mostRecentTime = Date.now();
    return function(e) {
        var then = new Date(e.createdAt).getTime();
        if (then > mostRecentTime) {
            mostRecentTime = then;
            return true;
        }
        return false;
    }
}

function unleashPoller(url) {
    return function(push, next) {
        push(null, request(url))
        next();
    }
}

function unleashStream(url, pollInterval) {
    pollInterval = pollInterval || 60000;
    return pollerToStream(unleashPoller(url))
        .ratelimit(1, pollInterval)
        .flatMap(promiseToStream)
        .map(JSON.parse)
        .flatMap(function(e)  { return arrayToStream(e.events.reverse()) })
        .filter(seenRecentlyPredicate());
}

module.exports = unleashStream;
