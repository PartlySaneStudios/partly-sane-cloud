# Endpoints

**Please request permission from the Partly Sane Skies admin team before using these endpoints!** (this is just so we can manage our server load)

## ``/v1/``

A test endpoint that responds with ``Partly Sane Cloud API: V1 Endpoints Enabled`` when enabled.

## ``/v1/hypixel/skyblockplayer``

Parameters:
``uuid``: The player's uuid

An endpoint that return three objects: 
``playerRaw`` is the raw hypixel achievements object
``skyblockRaw`` is the raw skyblock achievements object
``skyblockPlayer`` has the specific data needed for the Partly Sane Skies SkyblockPlayer class

## ``/v1/hypixel/bazaardata``

An endpoint that returns a json object in the following format:
```json
{
  "products": [
    {
      "itemId": "INK_SACK:3",
      "buyPrice": 44.7,
      "sellPrice": 0.7,
      "averageBuy": 44.7,
      "averageSell": 0.7
    }
  ]
}
```
Where the ``averageBuy`` is the average price of a sell order (``buyPrice``, instant buy) over the last 24 hours, and ``averageSell`` is the average price of a buy order (``sellPrice``, instant sell) over the last 24 hours.
