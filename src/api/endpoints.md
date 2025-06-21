# Endpoints

**Please request permission from the Partly Sane Skies admin team before using these endpoints!** (this is just so we can manage our server load)

## ``/v1/``

A test endpoint that responds with ``Partly Sane Cloud API: V1 Endpoints Enabled`` when enabled.

## ``/v1/status``

A test endpoint that responds with ``{ "success": true }`` when the server is up.

## /v1/pss/publicdata
Parameters:
``path``: The path of the file starting in the repository's main folder (usually path starts with ``/data/``)

An endpoint that proxies the PartlySaneStudios/partly-sane-skies-public-data GitHub repo for people living outside of GitHub's service area.

Returns:
The raw file of the GitHub. (This data may be cached)

## /v1/pss/mojangapi/byname
Parameters:
``name``: The name of the user who's Mojang profile you are trying to query

An endpoint that proxies and caches the Mojang API for stability and speed.

Returns two strings:

``name``: The name associated with the given profile

``uuid``: The uuid associated with the given profile

Response:
```json
{
  "id":"d3edf183d15040a497545df5669c8878",
  "name":"Su386"
}
```

## /v1/pss/mojangapi/byuuid
Parameters:
``uuid``: The uuid of the user who's Mojang profile you are trying to query

An endpoint that proxies and caches the Mojang API for stability and speed.

Returns two strings:

``name``: The name associated with the given profile

``uuid``: The uuid associated with the given profile

Response:
```json
{
  "id":"d3edf183d15040a497545df5669c8878",
  "name":"Su386"
}
```

## /v1/pss/funfact
And endpoint that returns a daily funfact.

Response:
```json
{
  "funFact": "While being the Lead Dev, Flagmaster only ever did 35 commits in which he changed ~1.5k lines"
}
```

## v1/pss/middlemanagement/resetpublicdatacache

Resets the caches for the public data endpoint.

## ``/v1/hypixel/skyblockplayer``

Parameters:
``uuid``: The player's uuid

An endpoint that relating to hypixel skyblock player data.

Returns three objects: 
``rawPlayer`` is the raw hypixel achievements endpoint object

``rawProfiles`` is the raw skyblock profiles endpoint object

``skyblockPlayer`` has the specific data needed for the Partly Sane Skies SkyblockPlayer class

Response:
```json
{
  "rawProfiles": {/*Skyblock data omitted*/},
  "rawPlayer": {/*Skyblock data omitted*/},
  "skyblockPlayer": {
    "currentProfileId": "",
    "profiles": [
      {
        "profileId": "372129ee-0608-4cac-9d03-0e11cc2ea896",
        "selected": false,
        "skyblockExperience": 6508,
        "catacombsExperience": 8109.877887816092,
        "combatExperience": 1021496.2201999953,
        "miningExperience": 19955294.739500005,
        "foragingExperience": 381659.549999997,
        "farmingExperience": 4267828.954987992,
        "enchantingExperience": 1899836.7390862256,
        "fishingExperience": 680677.476,
        "alchemyExperience": 741.4,
        "tamingExperience": 5444878.69250639,
        "armorData": "H4sIAAAAAAAAAONiYOBkYMzkYmBgYGEAAQCp5xppEQAAAA==",
        "quiverData": "H4sIAAAAAAAAAO3PvU7DMBAH8H/StCQeALGhLmZESEhMICaiQsVAG6kMzAab1FKaIPuqwhP5PfxgiBQW+gYg3U2n+9DdTwAFEisAjFOkViejBMNJt27pXGBAqh6guLfaTBtV+37qU2BPW//WqI8C2UPnTN5XMxzGcHmrVqo21zKGl7OLvnocw9UjKfJSaW203CxNK/2yoxMcxfAaQzOpZrNqLsvFonrKkc3VymC/b00b25Isnes2EDi4eyenSiJnn9dkfL59FMPvLSDF6OcwtvkO4YYJTGACE5jABCYwgQlM+JOE039I+B1ffYRsN0gMAAA=",
        "petName": "LEGENDARY SHEEP",
        "selectedDungeonClass": "healer",
        "normalRuns": [
            1,
            5,
            5,
            3,
            0,
            0,
            0,
            0
        ],
        "masterModeRuns": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
        ],
        "totalRuns": 14,
        "secretsCount": 13697,
        "baseHealth": 100,
        "baseDefense": 0,
        "baseIntelligence": 100,
        "baseEffectiveHealth": 100
      }
    ]
  }
}
```

## ``/v1/hypixel/skyblockitem``

An endpoint relating to skyblock items.

Response
```json
{
  "products": [
    {
      "itemId": "ZOOP_THE_FISH",
      "rarity": "SPECIAL",
      "name": "Zoop the Fish",
      "npcSell": 0,
      "bazaarBuy": 0,
      "bazaarSell": 0,
      "averageBazaarBuy": 0,
      "averageBazaarSell": 0,
      "lowestBin": 10000000,
      "averageLowestBin": 13000000,
      "material": "RAW_FISH",
      "unstackable": false
    }
  ]
}
```
``itemId`` - the skyblock id

``rarity`` - the skyblock rarity

``name`` - the ingame default name

``npcSell`` - the price to sell directly to a merchant NPC

``bazaarBuy`` - the bazaar instant buy price (sell order)

``bazaarSell`` - the bazaar instant sell price (buy order)

``averageBazaarBuy`` - the average instant buy price over the last 24 hours

``averageBazaarSell`` - the average instant sell price over the last 24 hours

``lowestBin`` - the current lowest bin

``averageLowestBin`` - the current average lowest bin

``material`` - the Material the item is made of

``unstackable`` - Whether the item has a custom UUID making it unstackable