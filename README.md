
# Yngwie

Yngwie provides simple a simple API to get events from an [unleash](https://github.com/finn-no/unleash/) server.

## Installation

Use the NPM dependency:

```
$ npm install runeh/yngwie
```

The package will be added to NPM once the API solidifies.

## Usage

```javascript
var yngwie = require('yngwie');

var unleashEventsUrl = 'http://unleash.herokuapp.com/events';
var client = new yngwie.UnleashEventSource(unleashEventsUrl);

client.on('connect', function() {
    console.log('connected');
});

// every event
client.on('event', function(event) {
    console.log('got event of type', event.type);
});

// a specific event
client.on('feature-created', function(event) {
    console.log('A feature was created:', event.data.name);
});

client.on('error', function(err) {
    console.log('error', err);
});
```

## UnleashEventSource

### UnleashEventSource(url[, pollInterval=60000])

The UnleashEventSource constructor takes two arguments.

`url` is the URL of the "events" url of an Unleash server. The second 

`pollInterval` is the number of milliseconds between each time the event URL is polled. It defaults to one minute.

UnleashEventSource extends node's event emitter. Thus it supports `on`, `once` and `removeListener`, 

### Events

`connect'. Triggered when the first event is received.

`event`. Triggered for every unleash event.

`error`. Triggered when an error occurs.

There are also separate events that map directly to unleash events. These are: `feature-revived`, `feature-created`, `feature-archive` (sic), `feature-updated`.

## UnleashEventStream

### UnleashEventStream(url[, pollInterval=60000])

UnlessEventStream is a [Highland](http://highlandjs.org/) stream that yields event objects. See the [Highland documentation](http://highlandjs.org/) for what operations are available on the stream. 

### Example


```javascript
var yngwie = require('yngwie');

var unleashEventsUrl = 'http://unleash.herokuapp.com/events';
var stream = new yngwie.UnleashEventStream(unleashEventsUrl);

stream
    .filter(function(e) { return e.type == 'feature-updated'; })
    .map(function(e) { 
        return e.data.name + ": " + e.data.enabled ? "enabled" : disabled;
    })
    .each(console.log);
```


## Notes

- The library does not replay events from the stream when it connects.
- The library uses the system clock to keep track of the most recently seen event. Thus you might lose a few events if there is a difference between the clocks on the unleash server and the machine running yngwie. This only applies 
to clock skew, not time zones. The library uses UTC.
