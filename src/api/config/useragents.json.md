# Useragents.json

## Default
```json
"default" : {
  "validAgents" : [
    ...
  ],

  "ignoreLogging": [
    ...
  ],

  "agentRateLimit": {
    ...
  }
}
```

The default settings used for the endpoint. These settings will be used if no setting is offered for the specific endpoint in the ``"endpoints"`` object (See \#Endpoints).
``"validAgents"`` - The agents that are valid under the default settings
``"ignoreLogging`` - The agents that will not be logged for statistics (not yet implemented).
``agentRateLimit`` - The rate limit for the entire agent (not yet implemented).

## Endpoints 
```json
"endpoints" : {
    ...
  }
```

An object containing each endpoint, and the settings to replace (same as default settings above)

Example:
```json
"/v1/status" : {
  "validAgents" : [
    "**/"
  ],

  "ignoreAgentLogging": [
    
  ]
}
```