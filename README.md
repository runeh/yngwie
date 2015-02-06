
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

`connect`. Triggered when the first event is received.

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
        return e.data.name + ": " + (e.data.enabled ? 'enabled' : 'disabled');
    })
    .each(console.log);
```

## Event data

The following are example event payloads:

### feature-created

```json
{
    "id": 142,
    "type": "feature-created",
    "createdBy": "unknown",
    "createdAt": "2015-02-06T12:23:41.072Z",
    "data": {
        "name": "frontend-trakcing",
        "description": "Enable sending frontend performance data",
        "strategy": "default",
        "enabled": true,
        "parameters": {}
    },
    "diffs": null
}
```

### feature-updated

```json
{
    "id": 149,
    "type": "feature-updated",
    "createdBy": "unknown",
    "createdAt": "2015-02-06T12:28:29.388Z",
    "data": {
        "name": "frontend-trakcing",
        "description": "Enable sending frontend performance data",
        "strategy": "default",
        "enabled": true,
        "parameters": {}
    },
    "diffs": [
        {
            "kind": "N",
            "path": [
                "strategy"
            ],
            "rhs": "default"
        },
        {
            "kind": "N",
            "path": [
                "enabled"
            ],
            "rhs": true
        },
        {
            "kind": "N",
            "path": [
                "parameters"
            ],
            "rhs": {}
        }
    ]
}
```

### feature-archive

```json
{
    "id": 144,
    "type": "feature-archive",
    "createdBy": "unknown",
    "createdAt": "2015-02-06T12:23:54.654Z",
    "data": {
        "name": "frontend-trakcing"
    },
    "diffs": [
        {
            "kind": "D",
            "path": [
                "description"
            ],
            "lhs": "Enable sending frontend performance data"
        },
        {
            "kind": "D",
            "path": [
                "strategy"
            ],
            "lhs": "default"
        },
        {
            "kind": "D",
            "path": [
                "enabled"
            ],
            "lhs": false
        },
        {
            "kind": "D",
            "path": [
                "parameters"
            ],
            "lhs": {}
        }
    ]
}
```

### feature-revive

```json
{
    "id": 145,
    "type": "feature-revive",
    "createdBy": "10.33.138.79",
    "createdAt": "2015-02-06T12:23:59.286Z",
    "data": {
        "name": "frontend-trakcing",
        "description": "Enable sending frontend performance data"
    },
    "diffs": [
        {
            "kind": "N",
            "path": [
                "description"
            ],
            "rhs": "Enable sending frontend performance data"
        }
    ]
}
```

## Notes

- The library does not replay events from the stream when it connects.
- The library uses the system clock to keep track of the most recently seen event. Thus you might lose a few events if there is a difference between the clocks on the unleash server and the machine running yngwie. This only applies 
to clock skew, not time zones. The library uses UTC.
