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
    return "#" + getRandomInt(50, 255).toString(16) + getRandomInt(50, 255).toString(16) + getRandomInt(50, 255).toString(16);
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


function unproject(coord) {
    return map.unproject(coord, map.getMaxZoom());
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

    var createWebImageryLayer = function(floorId) {
        var baseLayerURL = "https://tiles{s}.guildwars2.com/1/" + floorId + "/{z}/{x}/{y}.jpg";
        var imageryLayer = L.tileLayer(baseLayerURL, {
            minZoom: 0,
            maxZoom: 7,
            bounds: maxBounds,
            attribution: 'Map data and imagery &copy; <a href="https://www.arena.net/" target="_blank">ArenaNet</a>',
            subdomains: [1, 2, 3, 4]
        });
        return imageryLayer;
    }

    var baseMaps = {};
    var floorNames = ["Underground", "Surface", "Upper Level", "Depths"];
    // Force in Upper Level, Surface, Underground, Depths order :)
    _.forEach([2, 1, 0, 3], function(floorId) {
        var layer = createWebImageryLayer(floorId);
        baseMaps[floorNames[floorId]] = layer;
    });
    map.addLayer(baseMaps.Surface);

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

    var overlayMaps = {
        "Hero Challenges": heroLayer,
        "Landmarks": landmarkLayer,
        "Mastery Points": masteryLayer,
        "Tasks": taskLayer,
        "Vistas": vistaLayer,
        "Waypoints": waypointLayer,
        "Zones": zoneLayer
    };

/*
    var layers = [
        {
            "groupName": "Imagery",
            "type": "option",
            "layers": [
                {
                    "name": "Upper Level",
                    "layer": createWebImageryLayer(2)
                },
                {
                    "name": "Surface",
                    "layer": createWebImageryLayer(1)
                    "default": true
                },
                {
                    "name": "Underground",
                    "layer": createWebImageryLayer(0)
                },
                {
                    "name": "Depths",
                    "layer": createWebImageryLayer(3)
                }
            ]
        },
        {
            "groupName": "Features",
            "type": "checkbox",
            "layers": [
                {
                    "name": "Waypoints",
                    "layer": waypointLayer,
                    "minZoom": 2
                },
                {
                    "name": "Vistas",
                    "layer": vistaLayer,
                    "minZoom": 3
                },
                {
                    "name": "Landmarks",
                    "layer": landmarkLayer,
                    "minZoom": 3
                },
                {
                    "name": "Mastery Points",
                    "layer": masteryLayer,
                    "minZoom": 4,
                    "default": false
                },
                {
                    "name": "Hero Challenges",
                    "layer": heroLayer,
                    "minZoom": 4,
                    "default": false
                },
                {
                    "name": "Tasks",
                    "layer": taskLayer,
                    "minZoom": 4,
                    "default": false
                },
                {
                    "name": "Zones",
                    "layer": zoneLayer,
                    "default": false
                }
            ]
        }
    ];

    var improvedLayerControl = L.Control.extend({
        _zoomListener: function() {
            var currZoom = map.getZoom();
            if (this._zoom === null || this._zoom != currZoom) {
                _zoom = currZoom;
                this._update();
            }
        },
        _map: null,
        _zoom: null,
        options: {},
        initialize: function(layerData) {
            L.Util.setOptions(this, options);
            this._layerGroups = layerData;
        },
        onAdd: function(map) {
            this._initLayout();

            this._map = map;
            map.addListener(_zoomListener);

            return this._container;
        },
        onRemove: function(map) {
            map.removeListener(_zoomListener);
            this._map = null;
        },
        _update: function() {
            this._updateLayerVisibility();
            this._updateLayerControls();
        },
        _initLayout: function() {
            var className = 'leaflet-smart-layer-control';
            container = this._container = L.DomUtil.create('div', className);

            // Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
            container.setAttribute('aria-haspopup', true);

            if (L.Browser.touch) {
                L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
            } else {
                L.DomEvent.disableClickPropagation(container);
                L.DomEvent.on(container, 'wheel', L.DomEvent.stopPropagation);
            }

            var form = this._form = L.DomUtil.create('form', className + '-list');
            container.appendChild(form);

            var createTitle = function(name) {
                var titleDiv = L.DomUtil.create('div', 'classname + '-list-group-title'');
                titleDiv.textContent = name;
                return titleDiv;
            }

            var createOptionGroup = function(group) {
                var groupElement = L.DomUtil.create('div', classname + '-list-group');
                groupElement.appendChild(createTitle(group.name));
                _.forEach(layerGroup.layers, function(layer) {
                    layer.trackingId = guid();
                    var layerOption = L.DomUtil.create('input', classname + '-list-group-checkbox');
                    layerOption.type = "radio";
                    layerOption.name = group.name;
                    layerOption.id = layer.trackingId;
                    layerOption.value = layer.name;
                    if (layer.default) {
                        layerOption.checked = true;
                    }
                    groupElement.appendChild(layerOption);
                    
                    var layerLabel = L.DomUtil.create('label', classname + '-list-group-label');
                    layerLabel.for = layer.trackingId;
                    layerLabel.textContent = layer.name;
                    groupElement.appendChild(layerLabel);
                });
            };
            
            var createCheckboxGroup = function(group) {
                var groupElement = L.DomUtil.create('div', classname + '-list-group');
                groupElement.appendChild(createTitle(group.name));
                 _.forEach(layerGroup.layers, function(layer) {
                    layer.trackingId = guid();
                    var layerCheckbox = L.DomUtil.create('input', classname + '-list-group-checkbox');
                    layerCheckbox.type = "checkbox";
                    layerCheckbox.name = group.name;
                    layerCheckbox.id = layer.trackingId;
                    layerCheckbox.value = layer.name;
                    if (layer.default) {
                        layerCheckbox.checked = true;
                    }
                    groupElement.appendChild(layerCheckbox);
                    
                    var layerLabel = L.DomUtil.create('label', classname + '-list-group-label');
                    layerLabel.for = layer.trackingId;
                    layerLabel.textContent = layer.name;
                    groupElement.appendChild(layerLabel);
                });
            };

            _.forEach(this._layerGroups, function(layerGroup) {
                // Create/add a group element
                if (layerGroup.type === "checkbox") {
                    form.appendChild(createCheckboxGroup(layerGroup));
                } else if (layerGroup.type === "option") {
                    form.appendChild(createOptionGroup(layerGroup));
                } else {
                    console.log ("Group " + layerGroup.name + " has unknown type " + layerGroup.type + "; skipping...");
                }
                form.appendChild(L.DomUtil.create('hr'));
            });

            this._updateLayout();
        },
        _updateLayout: function() {
            // TODO: Update layout components
            _.forEach(this._layerGroups, function(layerGroup) {
                // Find the group element
                _.forEach(layerGroup.layers, function(layer) {
                    // Find the layer element
                    // Update as appropriate
                });
                // Update the group element
            });
        },
        _updateLayerVisibility: function() {
            // TODO: Update visibility
            _.forEach(this._layerGroups, function(layerGroup) {
                _.forEach(layerGroup.layers, function(layer) {
                    // Find the layer element
                    // If layer is checked and rules are passed, enable it
                    // Else disable it
                    
                });
            });
        }
    });


*/


    L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

    // Load World Data
    getMergedFloorData().then(function (worldData) {
        _.forEach(worldData.regions, function (region) {
            _.forEach(region.maps, function (gameMap) {
                var localZoneData = worldZones[gameMap.id];
                if (localZoneData !== undefined) {
                    localZoneData.apiData = gameMap;
                    localZoneData.assignedColor = getRandomColor();
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
                        if (localZoneData.zoneCategory === "GW2") {
                            marker = L.marker(unproject(masteryPoint.coord), {
                                title: "Mastery Point (Tyria)",
                                icon: icons.masterytyria,
                                type: "mastery",
                                subtype: "core"
                            });
                            masteryLayer.addLayer(marker);
                        } else if (localZoneData.zoneCategory === "HoT") {
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
                        if (localZoneData.zoneCategory === "GW2") {
                            marker = L.marker(unproject(skillChallenge.coord), {
                                title: "Hero Challenge (1x)",
                                icon: icons.skillcore,
                                type: "hero_point",
                                subtype: "core"
                            });
                            heroLayer.addLayer(marker);
                        } else if (localZoneData.zoneCategory === "HoT") {
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
                        color: localZoneData.assignedColor,
                        weight: 1,
                        feature: {
                          properties: {
                            name: localZoneData.name
                          }
                        }
                    });
                    zoneLayer.addLayer(zonerect);
                }
            });
        });
    }).catch(function (ex) {
        console.log("failed", ex);
    });
})();
