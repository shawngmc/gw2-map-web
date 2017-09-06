var map;

var generateIconURL = function(type, subtype) {
    return 'images/gw2/manual/' + type + (subtype !== undefined ? "_" + subtype : "") + ".png";
}

var icons = {};
icons.waypoint = L.icon({
    iconUrl: generateIconURL('waypoint'),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [-3, -3]
});
icons.landmark = L.icon({
    iconUrl: generateIconURL('landmark'),
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [-3, -3]
});
icons.vista = L.icon({
    iconUrl: generateIconURL('vista'),
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [-3, -3]
});
icons.masterytyria = L.icon({
    iconUrl: generateIconURL('mastery', 'core'),
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [-3, -3]
});
icons.masterymaguuma = L.icon({
    iconUrl: generateIconURL('mastery', 'maguuma'),
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [-3, -3]
});
icons.masterygeneric = L.icon({
    iconUrl: generateIconURL('mastery', 'unknown'),
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [-3, -3]
});
icons.skillcore = L.icon({
    iconUrl: generateIconURL('hero_point', 'core'),
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [-3, -3]
});
icons.skillmaguuma = L.icon({
    iconUrl: generateIconURL('hero_point', 'advanced'),
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [-3, -3]
});
icons.task = L.icon({
    iconUrl: generateIconURL('task'),
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [-3, -3]
});

var validMapIds = [26, 27, 28, 29, 30, 31, 326, 19, 20, 21, 22, 25, 32, 218, 51, 62, 65, 1203, 15, 17, 18, 23, 24, 50, 73, 873, 1185, 34, 35, 54, 91, 139, 39, 53, 1041, 1043, 1045, 1052, 1069, 1095, 1165, 988, 1015, 1210, 1175, 1195];


var zones = {};
zones.maguuma = ["Heart of Maguuma", "Ring of Fire"];
zones.crystal = ["Crystal Desert"];

function unproject(coord) {
    return map.unproject(coord, map.getMaxZoom());
}

function onMapClick(e) {
    console.log("You clicked the map at " + map.project(e.latlng));
}

function getZoneSet(zonename) {
    if (_.includes(zones.maguuma, zonename)) {
        return "Maguuma";
    } else if (_.includes(zones.crystal, zonename)) {
        return "Crystal";
    } else {
        return "Tyria";
    }
}

(function () {
    "use strict";

    var southWest, northEast;

    map = L.map("map", {
        minZoom: 0,
        maxZoom: 7,
        crs: L.CRS.Simple
    }).setView([0, 0], 0);

    southWest = unproject([0, 32768]);
    northEast = unproject([32768, 0]);
    var maxBounds = new L.LatLngBounds(southWest, northEast)

    map.setMaxBounds(maxBounds);

    var imageryLayer = L.tileLayer("https://tiles.guildwars2.com/1/1/{z}/{x}/{y}.jpg", {
        minZoom: 0,
        maxZoom: 7,
        bounds: maxBounds,
        attribution: 'Map data and imagery &copy; <a href="https://www.arena.net/" target="_blank">ArenaNet</a>'
    });
    map.addLayer(imageryLayer);

    map.on("click", onMapClick);


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
            return '<a href="#"><img src="' + generateIconURL(layerOpts.type, layerOpts.subtype) + '" height=16 width=16 />' + text + '</a>';
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


    var zones = {};
    // Load World POIs
    var worldDataResult = fetch('https://api.guildwars2.com/v2/continents/1/floors/1');
    worldDataResult.then(function (wdResponse) {
        return wdResponse.text();
    }).then(function (reponseBody) {
        var region, gameMap, poi;

        var worldData = JSON.parse(reponseBody);

        for (region in worldData.regions) {
            region = worldData.regions[region];
            _.forEach(region.maps, function (gameMap) {
                if (_.indexOf(validMapIds, gameMap.id) !== -1) {
                    var marker = null;
                    // Process POIs (Landmarks, Vistas, Waypoints)
                    _.forEach(gameMap.points_of_interest, function (poi) {
                        if (poi.type === "waypoint") {
                            marker = L.marker(unproject(poi.coord), {
                                title: poi.name,
                                icon: icons.waypoint,
                                type: poi.type
                            });
                            var span = document.createElement("span");
                            var links = {};
                            links.youtube = "https://www.youtube.com/results?search_query=gw2+" + poi.name.replace(" ", "+") + "+waypoint";
                            links.google = "https://www.google.com/search?q=gw2+" + poi.name.replace(" ", "+") + "+waypoint";
                            span.innerHTML = '<span>' + poi.name + '<br><a href="' + links.youtube + '" target="_blank"><img src="images/yt_icon_rgb.png" height="24" width="34" /></a><a href="' + links.google + '" target="_blank"><img src="images/google_icon.png" height="24" width="24" /></a></span>';
                            marker.bindPopup(span);
                            waypointLayer.addLayer(marker);
                        } else if (poi.type === "landmark") {
                            marker = L.marker(unproject(poi.coord), {
                                title: poi.name,
                                icon: icons.landmark,
                                type: poi.type
                            });
                            var span = document.createElement("span");
                            var links = {};
                            links.youtube = "https://www.youtube.com/results?search_query=gw2+" + poi.name.replace(" ", "+") + "+poi";
                            links.google = "https://www.google.com/search?q=gw2+" + poi.name.replace(" ", "+") + "+poi";
                            span.innerHTML = '<span>' + poi.name + '<br><a href="' + links.youtube + '" target="_blank"><img src="images/yt_icon_rgb.png" height="24" width="34" /></a><a href="' + links.google + '" target="_blank"><img src="images/google_icon.png" height="24" width="24" /></a></span>';
                            marker.bindPopup(span);
                            landmarkLayer.addLayer(marker);
                        } else if (poi.type === "vista") {
                            marker = L.marker(unproject(poi.coord), {
                                title: 'Vista',
                                icon: icons.vista,
                                type: poi.type
                            });
                            vistaLayer.addLayer(marker);
                        } else {
                            console.log('unknown poi type: ' + poi.type);
                        }
                    });

                    // Process Mastery points
                    marker = null;
                    _.forEach(gameMap.mastery_points, function (masteryPoint) {
                        var zoneset = getZoneSet(region.name);
                        if (zoneset === "Tyria") {
                            marker = L.marker(unproject(masteryPoint.coord), {
                                title: 'Mastery Point (Tyria)',
                                icon: icons.masterytyria,
                                type: "mastery",
                                subtype: "core"
                            });
                            masteryLayer.addLayer(marker);
                        } else if (zoneset === "Maguuma") {
                            marker = L.marker(unproject(masteryPoint.coord), {
                                title: 'Mastery Point (Maguuma)',
                                icon: icons.masterymaguuma,
                                type: "mastery",
                                subtype: "maguuma"
                            });
                            masteryLayer.addLayer(marker);
                        } else {
                            marker = L.marker(unproject(masteryPoint.coord), {
                                title: 'Mastery Point (???)',
                                icon: icons.masterygeneric,
                                type: "mastery",
                                subtype: "unknown"
                            });
                            masteryLayer.addLayer(marker);
                            console.log('unknown mastery region: ' + region.name + "; displaying generic...");
                        }
                    });

                    // Process Skill / Hero Challenges
                    marker = null;
                    _.forEach(gameMap.skill_challenges, function (skillChallenge) {
                        var zoneset = getZoneSet(region.name);
                        if (zoneset === "Tyria") {
                            marker = L.marker(unproject(skillChallenge.coord), {
                                title: 'Hero Challenge (1x)',
                                icon: icons.skillcore,
                                type: "hero_point",
                                subtype: "core"
                            });
                            heroLayer.addLayer(marker);
                        } else if (zoneset === "Maguuma") {
                            marker = L.marker(unproject(skillChallenge.coord), {
                                title: 'Hero Challenge (10x)',
                                icon: icons.skillmaguuma,
                                type: "hero_point",
                                subtype: "advanced"
                            });
                            heroLayer.addLayer(marker);
                        } else {
                            marker = L.marker(unproject(skillChallenge.coord), {
                                title: 'Hero Challenge (???)',
                                icon: icons.skillcore,
                                type: "hero_point",
                                subtype: "core"
                            });
                            heroLayer.addLayer(marker);
                            console.log('unknown skill challenge region: ' + region.name + "; displaying generic...");
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
                        var span = document.createElement("span");
                        var links = {};
                        links.youtube = "https://www.youtube.com/results?search_query=gw2+" + task.objective.replace(" ", "+") + "+heart";
                        links.google = "https://www.google.com/search?q=gw2+" + task.objective.replace(" ", "+") + "+heart";
                        span.innerHTML = '<span>Task: ' + task.objective + '<br><a href="' + links.youtube + '" target="_blank"><img src="images/yt_icon_rgb.png" height="24" width="34" /></a><a href="' + links.google + '" target="_blank"><img src="images/google_icon.png" height="24" width="24" /></a></span>';
                        marker.bindPopup(span);
                        taskLayer.addLayer(marker);
                    });

                    var name = gameMap['name'];
                    var baseBounds = gameMap['continent_rect'];
                    var bounds = [unproject(baseBounds[0]), unproject(baseBounds[1])];
                    if (_.size(gameMap['sectors']) > 0) {
                        zones[name] = bounds;
                    }
                }
            });
        }

        _.forOwn(zones, function(value, key) {
            var zonerect = L.rectangle(value, {color: "#ff7800", weight: 1});
            zoneLayer.addLayer(zonerect);
        });
    }).catch(function (ex) {
        console.log('failed', ex);
    });

    //var zones = {};

    // Load World Zone Definitions
    /*var allZoneResults = fetch('https://api.guildwars2.com/v2/continents/1/');
    allZoneResults.then(function (allZoneResponse) {
        return allZoneResponse.text();
    }).then(function (reponseBody) {

        var floorIDList = JSON.parse(reponseBody);

        for (var floorID in floorIDList) {
            var zoneResults = fetch('https://api.guildwars2.com/v2/continents/1/floors/' + floorID );
            zoneResults.then(function (zoneResponse) {
                return zoneResponse.text();
            }).then(function (reponseBody) {
                var floorData = JSON.parse(reponseBody);

                    for (var region in floorData) {

                    var name = region['name'];
                    var baseBounds = region['continent_rect'];
                    /*if (addRect) {
                        if (zoneData['continent_id'] !== 1) {
                            console.log(zoneData['continent_id']);
                        }
                        console.log(baseBounds);
                        var bounds = [unproject(baseBounds[0]), unproject(baseBounds[1])];
                        console.log(bounds);
                        var zonerect = L.rectangle(bounds, {color: "#ff7800", weight: 1}).addTo(map);
                        zoneLayer.addLayer(zonerect);
                    }
                    return true;***

                    zones[name] = baseBounds;
                }
            }).then(function (ex) {
                console.log('sleeping'); // Not sleeping as expected
                return sleep(5000);
            }).catch(function (ex) {
                console.log('failed', ex);
            });
        }
    }).catch(function (ex) {
        console.log('failed', ex);
    });

    _.forOwn(zones, function(value, key) {
        var zonerect = L.rectangle(value.bounds, {color: "#ff7800", weight: 1});
        zoneLayer.addLayer(zonerect);
    });*/


    /*var allZoneResults = fetch('https://api.guildwars2.com/v2/maps');
    allZoneResults.then(function (allZoneResponse) {
        return allZoneResponse.text();
    }).then(function (reponseBody) {

        var zoneIdList = JSON.parse(reponseBody);

        for (var mapID in zoneIdList) {
            var zoneResults = fetch('https://api.guildwars2.com/v2/maps/' + mapID );
            zoneResults.then(function (zoneResponse) {
                return zoneResponse.text();
            }).then(function (reponseBody) {
                var zoneData = JSON.parse(reponseBody);
                zones.push(zoneData);
                var baseBounds = zoneData['continent_rect'];
                var addRect = (baseBounds !== undefined);
                console.log('Continent: ' + zoneData['continent_id'] + ' Floor: ' + zoneData['default_floor'] + ' Rect: ' + baseBounds + ' Added: ' + addRect + ' Name: ' + zoneData['name']);
                if (addRect) {
                    if (zoneData['continent_id'] !== 1) {
                        console.log(zoneData['continent_id']);
                    }
                    console.log(baseBounds);
                    var bounds = [unproject(baseBounds[0]), unproject(baseBounds[1])];
                    console.log(bounds);
                    var zonerect = L.rectangle(bounds, {color: "#ff7800", weight: 1}).addTo(map);
                    zoneLayer.addLayer(zonerect);
                }
                return true;
            }).then(function (ex) {
                console.log('sleeping'); // Not sleeping as expected
                return sleep(5000);
            }).catch(function (ex) {
                console.log('failed', ex);
            });
        }
    }).catch(function (ex) {
        console.log('failed', ex);
    });

    console.log(_(zones).map('region').uniq().values());*/
})();


function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}
