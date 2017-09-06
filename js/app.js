/*globals L _ fetch console*/
"use strict";
var map;

var generateIconURL = function (type, subtype) {
    return 'images/gw2/manual/' + type + (subtype !== undefined ? "_" + subtype : "") + ".png";
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var getRandomColor = function () {
    return "#" + getRandomInt(0, 255).toString(16) + getRandomInt(0, 255).toString(16) + getRandomInt(0, 255).toString(16);
};

var generatePopupWithSearchIcons = function (objDesc, objType) {
    var span = document.createElement("span");
    var links = {};
    links.youtube = "https://www.youtube.com/results?search_query=gw2+" + objDesc.replace(" ", "+");
    links.google = "https://www.google.com/search?q=gw2+" + objDesc.replace(" ", "+");
    if (objType !== undefined) {
        links.youtube = links.youtube + "+" + objType.replace(" ", "+");
        links.google = links.google + "+" + objType.replace(" ", "+");
    }
    span.innerHTML = '<span>Task: ' + objDesc + '<br><a href="' + links.youtube + '" target="_blank"><img src="images/yt_icon_rgb.png" height="24" width="34" /></a><a href="' + links.google + '" target="_blank"><img src="images/google_icon.png" height="24" width="24" /></a></span>';
    return span;   
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
           
           return floorData[1];
        });
};

var icons = {};
icons.waypoint = L.icon({
    iconUrl: generateIconURL("waypoint"),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [-3, -3]
});
icons.landmark = L.icon({
    iconUrl: generateIconURL("landmark"),
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [-3, -3]
});
icons.vista = L.icon({
    iconUrl: generateIconURL("vista"),
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [-3, -3]
});
icons.masterytyria = L.icon({
    iconUrl: generateIconURL("mastery", "core"),
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [-3, -3]
});
icons.masterymaguuma = L.icon({
    iconUrl: generateIconURL("mastery", "maguuma"),
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [-3, -3]
});
icons.masterygeneric = L.icon({
    iconUrl: generateIconURL("mastery", "unknown"),
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [-3, -3]
});
icons.skillcore = L.icon({
    iconUrl: generateIconURL("hero_point", "core"),
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [-3, -3]
});
icons.skillmaguuma = L.icon({
    iconUrl: generateIconURL("hero_point", "advanced"),
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [-3, -3]
});
icons.task = L.icon({
    iconUrl: generateIconURL("task"),
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [-3, -3]
});

var maps = {
    26: "Dredgehaunt Cliffs",
    27: "Lornar's Pass",
    28: "Wayfarer Foothills",
    29: "Timberline Falls",
    30: "Frostgorge Sound",
    31: "Snowden Drifts",
    326: "Hoelbrak",
    19: "Plains of Ashford",
    20: "Blazeridge Steppes",
    21: "Fields of Ruin",
    22: "Fireheart Rise",
    25: "Iron Marches",
    32: "Diessa Plateau",
    218: "Black Citadel",
    51: "Straits of Devastation",
    62: "Cursed Shore",
    65: "Malchor's Leap",
    1203: "Siren's Landing",
    15: "Queensdale",
    17: "Harathi Hinterlands",
    18: "Divinity's Reach",
    23: "Kessex Hills",
    24: "Gendarran Fields",
    50: "Lion's Arch",
    73: "Bloodtide Coast",
    873: "Southsun Cove",
    1185: "Lake Doric",
    34: "Caledon Forest",
    35: "Metrica Province",
    54: "Brisban Wildlands",
    91: "The Grove",
    139: "Rata Sum",
    39: "Mount Maelstrom",
    53: "Sparkfly Fen",
    1041: "Dragon's Stand",
    1043: "Auric Basin",
    1045: "Tangled Depths",
    1052: "Verdant Brink",
    1068: "Gilded Hollow",
    1069: "Lost Precipice",
    1165: "Bloodstone Fen",
    988: "Dry Top",
    1015: "The Silverwastes",
    1210: "Crystal Oasis",
    1175: "Ember Bay",
    1195: "Draconis Mons"
};
var validMapIds = [26, 27, 28, 29, 30, 31, 326, 19, 20, 21, 22, 25, 32, 218, 51, 62, 65, 1203, 15, 17, 18, 23, 24, 50, 73, 873, 1185, 34, 35, 54, 91, 139, 39, 53, 1041, 1043, 1045, 1052, 1068, 1069, 1165, 988, 1015, 1210, 1175, 1195];


var continents = {};
continents.maguuma = ["Heart of Maguuma", "Ring of Fire"];
continents.crystal = ["Crystal Desert"];

function unproject(coord) {
    return map.unproject(coord, map.getMaxZoom());
}

function getZoneSet(zonename) {
    if (_.includes(continents.maguuma, zonename)) {
        return "Maguuma";
    } else if (_.includes(continents.crystal, zonename)) {
        return "Crystal";
    }
    return "Tyria";
}

(function () {
    "use strict";
    map = L.map("map", {
        minZoom: 0,
        maxZoom: 7,
        crs: L.CRS.Simple
    }).setView([0, 0], 0);

    var southWest = unproject([0, 32768]);
    var northEast = unproject([32768, 0]);
    var maxBounds = new L.LatLngBounds(southWest, northEast);

    map.setMaxBounds(maxBounds);

    var imageryLayer = L.tileLayer("https://tiles.guildwars2.com/1/1/{z}/{x}/{y}.jpg", {
        minZoom: 0,
        maxZoom: 7,
        bounds: maxBounds,
        attribution: 'Map data and imagery &copy; <a href="https://www.arena.net/" target="_blank">ArenaNet</a>'
    });
    map.addLayer(imageryLayer);


    var vistaLayer = new L.LayerGroup();
    var landmarkLayer = new L.LayerGroup();
    var waypointLayer = new L.LayerGroup();
    var masteryLayer = new L.LayerGroup();
    var zoneLayer = new L.LayerGroup();
    var taskLayer = new L.LayerGroup();
    var heroLayer = new L.LayerGroup();
    var markersLayer = new L.LayerGroup([
        waypointLayer,
        landmarkLayer,
        masteryLayer,
        vistaLayer,
        taskLayer,
        heroLayer
    ]);

    var controlSearch = new L.Control.Search({
        position: 'topleft',
        layer: markersLayer,
        initial: false,
        zoom: 7,
        marker: false,
        buildTip: function (text, val) {
            var layerOpts = val.layer.options;
            return "<a href=\"#\"><img src=\"" + generateIconURL(layerOpts.type, layerOpts.subtype) + "\" height=16 width=16 />" + text + "</a>";
        }
    });
    map.addControl(controlSearch);

    var baseMaps = {};

    var overlayMaps = {
        "Hero Challenges": heroLayer,
        "Landmarks": landmarkLayer,
        "Mastery Points": masteryLayer,
        "Tasks": taskLayer,
        "Vistas": vistaLayer,
        "Waypoints": waypointLayer,
        "Zones": zoneLayer
    };

    L.control.layers(baseMaps, overlayMaps).addTo(map);

    // Load World Data
    getMergedFloorData().then(function (worldData) {
        _.forEach(worldData.regions, function (region) {
            _.forEach(region.maps, function (gameMap) {
                if (_.indexOf(validMapIds, gameMap.id) !== -1) {
                    var newColor = getRandomColor();
                    var marker = null;
                    // Process POIs (Landmarks, Vistas, Waypoints)
                    _.forEach(gameMap.points_of_interest, function (poi) {
                        if (poi.type === "waypoint") {
                            marker = L.marker(unproject(poi.coord), {
                                title: poi.name,
                                icon: icons.waypoint,
                                type: poi.type
                            });
                            marker.bindPopup(generatePopupWithSearchIcons(poi.name, "waypoint"));
                            waypointLayer.addLayer(marker);
                        } else if (poi.type === "landmark") {
                            marker = L.marker(unproject(poi.coord), {
                                title: poi.name,
                                icon: icons.landmark,
                                type: poi.type
                            });
                            marker.bindPopup(generatePopupWithSearchIcons(poi.name, "poi"));
                            landmarkLayer.addLayer(marker);
                        } else if (poi.type === "vista") {
                            marker = L.marker(unproject(poi.coord), {
                                title: "Vista",
                                icon: icons.vista,
                                type: poi.type
                            });
                            vistaLayer.addLayer(marker);
                        } else {
                            console.log("unknown poi type: " + poi.type);
                        }
                    });

                    // Process Mastery points
                    marker = null;
                    _.forEach(gameMap.mastery_points, function (masteryPoint) {
                        var zoneset = getZoneSet(region.name);
                        if (zoneset === "Tyria") {
                            marker = L.marker(unproject(masteryPoint.coord), {
                                title: "Mastery Point (Tyria)",
                                icon: icons.masterytyria,
                                type: "mastery",
                                subtype: "core"
                            });
                            masteryLayer.addLayer(marker);
                        } else if (zoneset === "Maguuma") {
                            marker = L.marker(unproject(masteryPoint.coord), {
                                title: "Mastery Point (Maguuma)",
                                icon: icons.masterymaguuma,
                                type: "mastery",
                                subtype: "maguuma"
                            });
                            masteryLayer.addLayer(marker);
                        } else {
                            marker = L.marker(unproject(masteryPoint.coord), {
                                title: "Mastery Point (???)",
                                icon: icons.masterygeneric,
                                type: "mastery",
                                subtype: "unknown"
                            });
                            masteryLayer.addLayer(marker);
                            console.log("unknown mastery region: " + region.name + "; displaying generic...");
                        }
                    });

                    // Process Skill / Hero Challenges
                    marker = null;
                    _.forEach(gameMap.skill_challenges, function (skillChallenge) {
                        var zoneset = getZoneSet(region.name);
                        if (zoneset === "Tyria") {
                            marker = L.marker(unproject(skillChallenge.coord), {
                                title: "Hero Challenge (1x)",
                                icon: icons.skillcore,
                                type: "hero_point",
                                subtype: "core"
                            });
                            heroLayer.addLayer(marker);
                        } else if (zoneset === "Maguuma") {
                            marker = L.marker(unproject(skillChallenge.coord), {
                                title: "Hero Challenge (10x)",
                                icon: icons.skillmaguuma,
                                type: "hero_point",
                                subtype: "advanced"
                            });
                            heroLayer.addLayer(marker);
                        } else {
                            marker = L.marker(unproject(skillChallenge.coord), {
                                title: "Hero Challenge (???)",
                                icon: icons.skillcore,
                                type: "hero_point",
                                subtype: "core"
                            });
                            heroLayer.addLayer(marker);
                            console.log("unknown skill challenge region: " + region.name + "; displaying generic...");
                        }
                    });

                    // Process Hearts / Tasks
                    marker = null;
                    _.forEach(gameMap.tasks, function (task) {
                        marker = L.marker(unproject(task.coord), {
                            title: "Task: " + task.objective,
                            icon: icons.task,
                            type: "task"
                        });
                        marker.bindPopup(generatePopupWithSearchIcons(task.objective, "heart"));
                        taskLayer.addLayer(marker);
                    });

                    var baseBounds = gameMap.continent_rect;
                    var bounds = [unproject(baseBounds[0]), unproject(baseBounds[1])];
                    
                    var zonerect = L.rectangle(bounds, {
                        color: newColor,
                        weight: 1
                    });
                    zoneLayer.addLayer(zonerect);
                }
            });
        });
    }).catch(function (ex) {
        console.log("failed", ex);
    });
})();