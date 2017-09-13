/*globals L _ fetch console*/
(function () {
    "use strict";
    var map;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./js/mapdata-service-worker.js');
    }
    
    var generateIconURL = function (type, subtype) {
        return 'images/gw2/manual/' + type + (subtype !== undefined ? "_" + subtype : "") + ".png";
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
    
    var uuidv4 = function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    
    var getWorldData = function() {
        return fetch("../data/zonedata.json")
            .then((worldDataRequestResponse) => {
                return worldDataRequestResponse.text();
            })
            .then((worldDataRaw) => {
                return JSON.parse(worldDataRaw);
            })
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
    
    var unproject = function(coord) {
        return map.unproject(coord, map.getMaxZoom());
    }

    map = L.map("map", {
        minZoom: 1,
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
    _.forEach([2, 1, 0, 3], (floorId) => {
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

    /*var controlSearch = new L.Control.Search({
        position: 'topleft',
        layer: markersLayer,
        initial: false,
        zoom: 7,
        marker: false,
        buildTip: (text, val) => {
            var layerOpts = val.layer.options;
            return "<a href=\"#\"><img src=\"" + generateIconURL(layerOpts.type, layerOpts.subtype) + "\" height=16 width=16 />" + text + "</a>";
        }
    });
    map.addControl(controlSearch);*/

    var overlayMaps = {
        "Hero Challenges": heroLayer,
        "Landmarks": landmarkLayer,
        "Mastery Points": masteryLayer,
        "Tasks": taskLayer,
        "Vistas": vistaLayer,
        "Waypoints": waypointLayer,
        "Zones": zoneLayer
    };


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
                    "layer": createWebImageryLayer(1),
                    "defaultState": true
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
                    "minZoom": 2,
                    "defaultState": true
                },
                {
                    "name": "Vistas",
                    "layer": vistaLayer,
                    "minZoom": 3,
                    "defaultState": true
                },
                {
                    "name": "Landmarks",
                    "layer": landmarkLayer,
                    "minZoom": 3,
                    "defaultState": true
                },
                {
                    "name": "Mastery Points",
                    "layer": masteryLayer,
                    "minZoom": 4,
                    "defaultState": false
                },
                {
                    "name": "Hero Challenges",
                    "layer": heroLayer,
                    "minZoom": 4,
                    "defaultState": false
                },
                {
                    "name": "Tasks",
                    "layer": taskLayer,
                    "minZoom": 4,
                    "defaultState": false
                },
                {
                    "name": "Zones",
                    "layer": zoneLayer,
                    "defaultState": false
                }
            ]
        }
    ];

    L.Control.ImprovedLayerControl = L.Control.extend({
        _zoomListener: function() {
            var currZoom = map.getZoom();
            if (this._zoom === null || this._zoom != currZoom) {
                this._zoom = currZoom;
                this._update();
            }
        },
        _changeListener: function(event) {
            this._updateLayerVisibility();
        },
        _map: null,
        _zoom: null,
        initialize: function(options) {
          this._layerData = options.layerData;
        },
        onAdd: function(map) {
            this._initLayout();

            this._map = map;
            map.on('zoomend', this._zoomListener);
            return this._container;
        },
        onRemove: function(map) {
            map.off('zoomend', this._zoomListener);
            this._map = null;
        },
        _update: function() {
            this._updateLayerVisibility();
            this._updateLayerControls();
        },
        _initLayout: function() {
            var className = 'leaflet-smart-layer-control';
            var container = this._container = L.DomUtil.create('div', className);

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

            var createTitle = (name) => {
                var titleDiv = L.DomUtil.create('div', className + "-list-group-title");
                titleDiv.textContent = name;
                return titleDiv;
            }

            var createGroupElements = (layerGroup) => {
                var groupElement = L.DomUtil.create('div', className + '-list-group');
                groupElement.appendChild(createTitle(layerGroup.name));
                _.forEach(layerGroup.layers, (layerWrapper) => {
                    layerWrapper.trackingId = uuidv4();
                    var layerControlElement = null;
                    if (layerGroup.type === "checkbox") {
                        layerControlElement = L.DomUtil.create('input', className + '-list-group-checkbox');
                        layerControlElement.type = "checkbox";
                    } else if (layerGroup.type === "option") {
                        layerControlElement = L.DomUtil.create('input', className + '-list-group-radio');
                        layerControlElement.type = "radio";
                    }                  
                    layerControlElement.name = layerGroup.name;
                    layerControlElement.id = layerWrapper.trackingId;
                    layerControlElement.value = layerWrapper.name;
                    if (layerWrapper.defaultState === true) {
                        layerControlElement.checked = true;
                    }
                    layerWrapper.element = layerControlElement;
                    layerControlElement.addEventListener('onchange', (event) => {console.log('listening'); this._changeListener(event);});
                    groupElement.appendChild(layerControlElement);
                    
                    var layerLabel = L.DomUtil.create('label', className + '-list-group-label');
                    layerLabel.for = layerWrapper.trackingId;
                    layerLabel.textContent = layerWrapper.name;
                    layerWrapper.label = layerLabel;
                    groupElement.appendChild(layerLabel);
                });
                return groupElement;
            };

            _.forEach(this._layerData, (layerGroup) => {
                form.appendChild(createGroupElements(layerGroup));
                form.appendChild(L.DomUtil.create('hr'));
            });

            this._updateLayout();
        },
        _getLayerBlockRule: function(layer) {
            if (layer.minZoom !== undefined && layer.minZoom <= this._zoom) {
                return "Zoom in to use."
            } else if (layer.maxZoom !== undefined && layer.maxZoom >= this._zoom) {
                return "Zoom out to use."
            } else {
                return null;
            }
        },
        _updateLayout: function() {
            _.forEach(this._layerData, (layerGroup) => {
                _.forEach(layerGroup.layers, (layerWrapper) => {
                    var layerBlockRule = this._getLayerBlockRule(layerWrapper);
                    layerWrapper.element.disabled = (layerBlockRule !== null);
                });
            });
        },
        _updateLayerVisibility: function() {
            console.log('Updating layer visibility...');
            _.forEach(this._layerData, (layerGroup) => {
                _.forEach(layerGroup.layers, (layerWrapper) => {
                    var layerBlockRule = this._getLayerBlockRule(layerWrapper);
                    var applyLayer = (layerWrapper.element.checked && layerBlockRule === null);
                    var layerOnMap = map.hasLayer(layerWrapper.layer);
                    
                    if (applyLayer && !layerOnMap) {
                        // The layer should apply and is not on the map, add it
                        console.log('adding layer: ' + layerWrapper.name);
                        map.addLayer(layerWrapper.layer);
                    } else if (!applyLayer && layerOnMap) {
                        // The layer shoulf not apply to the map, but is already on there, remove it
                        console.log('removing layer: ' + layerWrapper.name);
                        map.removeLayer(layerWrapper.layer);
                    }
                    // Otherwise, no action is necessary
                });
            });
        }
    });
    
    L.control.improvedLayerControl = function(opts) {
        return new L.Control.ImprovedLayerControl(opts);
    }
    L.control.improvedLayerControl({ "layerData" : layers }).addTo(map);


   // L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

    // Load World Data
    getWorldData().then(function (worldData) {
        _.forOwn(worldData, function (gameMap) {
            var marker = null;
            // Process POIs (Landmarks, Vistas, Waypoints)
            _.forEach(gameMap.points_of_interest, (poi) => {
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
            _.forEach(gameMap.mastery_points, (masteryPoint) => {
                if (gameMap.customData.zoneCategory === "GW2") {
                    marker = L.marker(unproject(masteryPoint.coord), {
                        title: "Mastery Point (Tyria)",
                        icon: icons.masterytyria,
                        type: "mastery",
                        subtype: "core"
                    });
                    masteryLayer.addLayer(marker);
                } else if (gameMap.customData.zoneCategory === "HoT") {
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
                    console.log("unknown mastery region: " + gameMap.customData.region.name + "; displaying generic...");
                }
            });

            // Process Skill / Hero Challenges
            marker = null;
            _.forEach(gameMap.skill_challenges, (skillChallenge) => {
                if (gameMap.customData.zoneCategory === "GW2") {
                    marker = L.marker(unproject(skillChallenge.coord), {
                        title: "Hero Challenge (1x)",
                        icon: icons.skillcore,
                        type: "hero_point",
                        subtype: "core"
                    });
                    heroLayer.addLayer(marker);
                } else if (gameMap.customData.zoneCategory === "HoT") {
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
                    console.log("unknown skill challenge region: " + gameMap.customData.region.name + "; displaying generic...");
                }
            });

            // Process Hearts / Tasks
            marker = null;
            _.forEach(gameMap.tasks, (task) => {
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
                color: gameMap.customData.assignedColor,
                weight: 1,
                feature: {
                    properties: {
                    name: gameMap.customData.name
                    }
                }
            });
            zoneLayer.addLayer(zonerect);
        });
    }).catch(function (ex) {
        console.log("failed", ex);
    });
})();
