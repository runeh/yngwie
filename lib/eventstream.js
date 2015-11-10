var request = require('request-promise');
var highland = require('highland');
var promiseToStream = highland;
var arrayToStream = highland;
var pollerToStream = highland;


function eventTime(event) {
    return new Date(event.createdAt).getTime();
}

function max(haystack) {
    return haystack.reduce(function(a, b) { return Math.max(a, b); }, 0);
}

function unleashPoller(url) {
    return function(push, next) {
        push(null, request(url))
        next();
    }
}

function seenItemRemover(firstTime) {
    var mostRecentTimestamp = firstTime || 0;
    firstRun = true;
    return function(events) {
        events = events.filter(function(e) { return eventTime(e) > mostRecentTimestamp});
        mostRecentTimestamp = Math.max(mostRecentTimestamp, max(events.map(eventTime)));
        if (firstRun) { 
            firstRun = false;
            events = []; 
        }
        return events;
    }
}

function unleashStream(url, pollInterval) {
    pollInterval = pollInterval || 60000;
    return pollerToStream(unleashPoller(url))
        .ratelimit(1, pollInterval)
        .flatMap(promiseToStream)
        .map(JSON.parse)
        .map(function(e) { return e.events.reverse(); })
        .map(seenItemRemover())
        .flatMap(arrayToStream);
}

module.exports = unleashStream;
