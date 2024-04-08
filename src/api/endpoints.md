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

## /v1/pss/funfact
And endpoint that returns a daily funfact.

Response:
```json
{
  "funFact": "While being the Lead Dev, Flagmaster only ever did 35 commits in which he changed ~1.5k lines"
}
```

## v1/pss/middlemanagement/resetpublicdatacache


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
      "lowestBin": 7000000,
      "averageLowestBin": 7000000
    }
  ]
}
```
``itemId`` - the skyblock id,
``rarity`` - the skyblock rarity
``name`` - the ingame default name
``npcSell`` - the price to sell directly to a merchant NPC
``bazaarBuy`` - the bazaar instant buy price (sell order)
``bazaarSell`` - the bazaar instant sell price (buy order)
``averageBazaarBuy`` - the average instant buy price over the last 24 hours
``averageBazaarSell`` - the average instant sell price over the last 24 hours
``lowestBin`` - the current lowest bin
``averageLowestBin`` - the current average lowest bin
