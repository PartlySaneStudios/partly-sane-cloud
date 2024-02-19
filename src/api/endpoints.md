# Endpoints

**Please request permission from the Partly Sane Skies admin team before using these endpoints!** (this is just so we can manage our server load)

## ``/v1/``

A test endpoint that responds with ``Partly Sane Cloud API: V1 Endpoints Enabled`` when enabled.

## ``/v1/hypixel/skyblockplayer``

Parameters:
``uuid``: The player's uuid

An endpoint that return three objects: 
``rawPlayer`` is the raw hypixel achievements endpoint object
``rawProfiles`` is the raw skyblock profiles endpoint object
``skyblockPlayer`` has the specific data needed for the Partly Sane Skies SkyblockPlayer class
```json
{
  "rawProfiles": {/*Skyblock data ommited*/},
  "rawPlayer": {/*Skyblock data ommited*/},
  "skyblockPlayer": {
    "currentProfileId": "",
    "profiles": [
      {
        "profileId": "",
        "selected": false,
        "skyblockExperience": 0,
        "catacombsExperience": 0,
        "combatExperience": 0,
        "miningExperience": 0,
        "foragingExperience": 0,
        "farmingExperience": 0,
        "enchantingExperience": 0,
        "fishingExperience": 0,
        "alchemyExperience": 0,
        "tamingExperience": 0,
        "armorData": "",
        "quiverData": "",
        "petName": "Legendary Sheep Pet",
        "selectedDungeonClass": "mage",
        "normalRuns": [
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
        ],
        "masterModeRuns": [
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
        ],
        "totalRuns": 16,
        "secretsCount": 0,
        "baseHealth": 100,
        "baseDefense": 0,
        "baseIntelligence": 100,
        "baseEffectiveHealth": 100
      }
    ]
  }
}
```

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
