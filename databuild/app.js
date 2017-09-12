/*globals L _ fetch console*/
"use strict";

var worldZones = {
    26: { "name": "Dredgehaunt Cliffs", "type": "Story", "zoneCategory": "GW2" },
    27: { "name": "Lornar's Pass", "type": "Story", "zoneCategory": "GW2" },
    28: { "name": "Wayfarer Foothills", "type": "Story", "zoneCategory": "GW2" },
    29: { "name": "Timberline Falls", "type": "Story", "zoneCategory": "GW2" },
    30: { "name": "Frostgorge Sound", "type": "Story", "zoneCategory": "GW2" },
    31: { "name": "Snowden Drifts", "type": "Story", "zoneCategory": "GW2" },
    326: { "name": "Hoelbrak", "type": "City", "zoneCategory": "GW2" },
    19: { "name": "Plains of Ashford", "type": "Story", "zoneCategory": "GW2" },
    20: { "name": "Blazeridge Steppes", "type": "Story", "zoneCategory": "GW2" },
    21: { "name": "Fields of Ruin", "type": "Story", "zoneCategory": "GW2" },
    22: { "name": "Fireheart Rise", "type": "Story", "zoneCategory": "GW2" },
    25: { "name": "Iron Marches", "type": "Story", "zoneCategory": "GW2" },
    32: { "name": "Diessa Plateau", "type": "Story", "zoneCategory": "GW2" },
    218: { "name": "Black Citadel", "type": "City", "zoneCategory": "GW2" },
    51: { "name": "Straits of Devastation", "type": "Story", "zoneCategory": "GW2" },
    62: { "name": "Cursed Shore", "type": "Story", "zoneCategory": "GW2" },
    65: { "name": "Malchor's Leap", "type": "Story", "zoneCategory": "GW2" },
    15: { "name": "Queensdale", "type": "Story", "zoneCategory": "GW2" },
    17: { "name": "Harathi Hinterlands", "type": "Story", "zoneCategory": "GW2" },
    18: { "name": "Divinity's Reach", "type": "City", "zoneCategory": "GW2" },
    23: { "name": "Kessex Hills", "type": "Story", "zoneCategory": "GW2" },
    24: { "name": "Gendarran Fields", "type": "Story", "zoneCategory": "GW2" },
    50: { "name": "Lion's Arch", "type": "City", "zoneCategory": "GW2" },
    73: { "name": "Bloodtide Coast", "type": "Story", "zoneCategory": "GW2" },
    873: { "name": "Southsun Cove", "type": "Story", "zoneCategory": "GW2" },
    34: { "name": "Caledon Forest", "type": "Story", "zoneCategory": "GW2" },
    35: { "name": "Metrica Province", "type": "Story", "zoneCategory": "GW2" },
    54: { "name": "Brisban Wildlands", "type": "Story", "zoneCategory": "GW2" },
    91: { "name": "The Grove", "type": "City", "zoneCategory": "GW2" },
    139: { "name": "Rata Sum", "type": "City", "zoneCategory": "GW2" },
    39: { "name": "Mount Maelstrom", "type": "Story", "zoneCategory": "GW2" },
    53: { "name": "Sparkfly Fen", "type": "Story", "zoneCategory": "GW2" },
    988: { "name": "Dry Top", "type": "Story", "zoneCategory": "GW2" },
    1015: { "name": "The Silverwastes", "type": "Story", "zoneCategory": "HoT" },

    // Heart of Thorns
    1041: { "name": "Dragon's Stand", "type": "Story", "zoneCategory": "HoT" },
    1043: { "name": "Auric Basin", "type": "Story", "zoneCategory": "HoT" },
    1045: { "name": "Tangled Depths", "type": "Story", "zoneCategory": "HoT" },
    1052: { "name": "Verdant Brink", "type": "Story", "zoneCategory": "HoT" },
    1068: { "name": "Gilded Hollow", "type": "Guild Hall", "zoneCategory": "HoT" },
    1069: { "name": "Lost Precipice", "type": "Guild Hall", "zoneCategory": "HoT" },

    // Living World Season 3
    1165: { "name": "Bloodstone Fen", "type": "Living World: Season 3, Chapter 1", "zoneCategory": "HoT" },
    1175: { "name": "Ember Bay", "type": "Living World: Season 3, Chapter 2", "zoneCategory": "HoT" },
    1178: { "name": "Bitterfrost Frontier", "type": "Living World: Season 3, Chapter 3", "zoneCategory": "HoT" },
    1185: { "name": "Lake Doric", "type": "Living World: Season 3, Chapter 4", "zoneCategory": "HoT" },
    1195: { "name": "Draconis Mons", "type": "Living World: Season 3, Chapter 5", "zoneCategory": "HoT" },
    1203: { "name": "Siren's Landing", "type": "Living World: Season 3, Chapter 6", "zoneCategory": "HoT" },

    // Path of Fire
    1210: { "name": "Crystal Oasis", "type": "Story", "zoneCategory": "PoF" },
};


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var getRandomColor = function () {
    return "#" + getRandomInt(50, 255).toString(16) + getRandomInt(50, 255).toString(16) + getRandomInt(50, 255).toString(16);
};

var getMergedFloorData = function () {
    return Promise.all([fetch("https://api.guildwars2.com/v2/continents/1/floors/0"), fetch("https://api.guildwars2.com/v2/continents/1/floors/1")])
        .then(function (floorDataRequestResponses) {
            return Promise.all([floorDataRequestResponses[0].text(), floorDataRequestResponses[1].text()]);
        })
        .then(function (floorDataRawResponses) {
            // Hack - Force Gilded Hollow Data in!
            var floorData = [];
            floorData[0] = JSON.parse(floorDataRawResponses[0]);
            floorData[1] = JSON.parse(floorDataRawResponses[1]);

            // Data fix - force Gilded Hollow into floor 1;
            floorData[1].regions[10].maps[1068] = floorData[0].regions[10].maps[1068];

            // Data fix - change top of Dry Top to Bottom of Silverwastes - there is MUCH less overlap than it thinks!
            floorData[1].regions[11].maps[988].continent_rect[0][1] = floorData[1].regions[11].maps[1015].continent_rect[1][1];

            // Flatten the maps and pare down to zones of interest/mixin our data
            var slimdata = {};
            _.forEach(floorData[1].regions, function (region) {
                _.forEach(region.maps, function (gameMap) {
                    if (_.has(worldZones, gameMap.id)) {
                        gameMap.customData = worldZones[gameMap.id];
                        gameMap.customData.region = region.id;
                        slimdata[gameMap.id] = gameMap;
                    }
                });
            });

            document.getElementById('builddata').textContent = JSON.stringify(slimdata, null, 4);
        });
};

(function () {
    "use strict";

    
    // Spit out world data
    getMergedFloorData();
})();
