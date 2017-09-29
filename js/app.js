/*globals L _ fetch console showdown*/
(function () {
    "use strict";

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./js/mapdata-service-worker.js');
    }

    var generateIconURL = function (type, subtype) {
        return 'images/gw2/manual/' + type + (subtype !== undefined ? "_" + subtype : "") + ".png";
    };

    var generatePopupWithSearchIcons = function (objDesc, objType, objChatLink) {
        var span = document.createElement("span");
        var links = {};
        links.youtube = "https://www.youtube.com/results?search_query=gw2+" + objDesc.replace(" ", "+");
        links.google = "https://www.google.com/search?q=gw2+" + objDesc.replace(" ", "+");
        if (objType !== undefined) {
            links.youtube = links.youtube + "+" + objType.replace(" ", "+");
            links.google = links.google + "+" + objType.replace(" ", "+");
        }
        var popupContents = '';
        popupContents += '<span>Task: ' + objDesc + '<br>';
        if (objChatLink !== undefined && objChatLink !== null) {
            popupContents += '<input type="text" value="' + objChatLink +'" class="linkarea" readonly><i class="fa fa-clipboard" aria-hidden="true" onClick=></i>';
        }
        popupContents += '<a href="' + links.youtube + '" target="_blank"><img src="images/yt_icon_rgb.png" height="16" width="22" /></a><a href="' + links.google + '" target="_blank"><img src="images/google_icon.png" height="16" width="16" /></a></span>';
        span.innerHTML = popupContents;
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
    icons.masterycrystal = L.icon({
        iconUrl: generateIconURL("mastery", "crystal"),
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

    var map;
    map = L.map("map", {
        minZoom: 1,
        maxZoom: 7,
        crs: L.CRS.Simple
    }).setView([0, 0], 0);

    var southWest = unproject([0, 40000]);
    var northEast = unproject([40000, 0]);
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

    var controlSearch = new L.Control.Search({
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
    map.addControl(controlSearch);

    var layers = [
        {
            "groupName": "Imagery",
            "type": "layeroption",
            "layers": [
                {
                    "name": "Upper Level",
                    "display": "iconOnly",
                    "icon": '../images/layer_white.svg',
                    "layer": createWebImageryLayer(2)
                },
                {
                    "name": "Surface",
                    "display": "iconOnly",
                    "icon": '../images/layer_white.svg',
                    "layer": createWebImageryLayer(1),
                    "defaultState": true
                },
                {
                    "name": "Underground",
                    "display": "iconOnly",
                    "icon": '../images/layer_white.svg',
                    "layer": createWebImageryLayer(0)
                },
                {
                    "name": "Depths",
                    "display": "iconOnly",
                    "icon": '../images/layer_white.svg',
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
                    "icon": generateIconURL("waypoint"),
                    "display": "iconOnly",
                    "minZoom": 2,
                    "defaultState": true
                },
                {
                    "name": "Vistas",
                    "layer": vistaLayer,
                    "icon": generateIconURL("vista"),
                    "display": "iconOnly",
                    "minZoom": 3,
                    "defaultState": true
                },
                {
                    "name": "Landmarks",
                    "layer": landmarkLayer,
                    "icon": generateIconURL("landmark"),
                    "display": "iconOnly",
                    "minZoom": 3,
                    "defaultState": true
                },
                {
                    "name": "Mastery Points",
                    "layer": masteryLayer,
                    "icon": generateIconURL("mastery", "core"),
                    "display": "iconOnly",
                    "minZoom": 4,
                    "defaultState": false
                },
                {
                    "name": "Hero Challenges",
                    "layer": heroLayer,
                    "icon": generateIconURL("hero_point", "core"),
                    "display": "iconOnly",
                    "minZoom": 4,
                    "defaultState": false
                },
                {
                    "name": "Tasks",
                    "layer": taskLayer,
                    "icon": generateIconURL("task"),
                    "display": "iconOnly",
                    "minZoom": 4,
                    "defaultState": false
                },
                {
                    "name": "Zones",
                    "layer": zoneLayer,
                    "icon": generateIconURL("zone"),
                    "display": "iconOnly",
                    "defaultState": false
                }
            ]
        }
    ];

    L.Control.ImprovedLayerControl = L.Control.extend({
        _zoomListener: function(event) {
            this._zoom = map.getZoom();
            this._update();
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
            map.on('zoomend', (event) => {console.log('listening'); this._zoomListener(event);});
            return this._container;
        },
        onRemove: function(map) {
            map.off('zoomend', (event) => {console.log('listening'); this._zoomListener(event);});
            this._map = null;
        },
        _update: function() {
            this._updateLayerVisibility();
            this._updateLayout();
        },
        _initLayout: function() {
            var className = 'leaflet-smart-layer-control';
            var container = this._container = L.DomUtil.create('div', className + ' leaflet-bar leaflet-control leaflet-control-custom');

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
                var titleDiv = L.DomUtil.create('div', 'layermanager-list-group-title');
                titleDiv.textContent = name;
                return titleDiv;
            }

            var createGroupElements = (layerGroup) => {
                var groupElement = L.DomUtil.create('div', 'layermanager-list-group');
                groupElement.appendChild(createTitle(layerGroup.groupName));
                if (layerGroup.type === "layeroption") {
                    groupElement.style = "margin-bottom: 25px";   
                }

                var layerIdx = null;
                _.forEach(layerGroup.layers, (layerWrapper) => {
                    layerWrapper.trackingId = uuidv4();
                    var layerControlElement = null;
                    if (layerGroup.type === "checkbox") {
                        layerControlElement = L.DomUtil.create('input', 'layermanager-list-group-checkbox');
                        layerControlElement.type = "checkbox";
                    } else if (layerGroup.type === "option") {
                        layerControlElement = L.DomUtil.create('input', 'layermanager-list-group-radio');
                        layerControlElement.type = "radio";
                    } else if (layerGroup.type === "layeroption") {
                        layerControlElement = L.DomUtil.create('input', 'layermanager-list-group-layerradio');
                        layerControlElement.type = "radio";
                        if (layerIdx === null) {
                            layerIdx = 0;
                        } else {
                            layerIdx = layerIdx + 1;
                        }
                        layerControlElement.style = "top: " + (layerIdx + 1) * 20 + "px;z-index:" + layerIdx;
                    }
                    layerControlElement.name = layerGroup.name;
                    layerControlElement.id = layerWrapper.trackingId;
                    layerControlElement.value = layerWrapper.name;
                    if (layerWrapper.defaultState === true) {
                        layerControlElement.checked = true;
                    }
                    layerWrapper.element = layerControlElement;
                    layerControlElement.addEventListener('change', (event) => {console.log('listening'); this._changeListener(event);});
                    groupElement.appendChild(layerControlElement);

                    var layerLabel = null;
                    if (layerWrapper.display === "iconOnly") {
                        layerLabel = L.DomUtil.create('label', 'layermanager-list-iconlabel');
                        layerLabel.htmlFor = layerWrapper.trackingId;
                        var iconElement = L.DomUtil.create('img');
                        iconElement.src = layerWrapper.icon;
                        iconElement.height = 32;
                        iconElement.width = 32;
                        iconElement.title = layerWrapper.name;
                        iconElement.alt = layerWrapper.name;
                        if (layerIdx !== null) {
                            iconElement.style = "top: " + (layerIdx + 1) * 20 + "px;z-index:" + layerIdx;
                        }
                        layerLabel.appendChild(iconElement);
                    } else {
                        layerLabel = L.DomUtil.create('label', 'layermanager-list-textlabel');
                        layerLabel.htmlFor = layerWrapper.trackingId;
                        layerLabel.textContent = layerWrapper.name;
                    }
                    layerWrapper.label = layerLabel;
                    groupElement.appendChild(layerLabel);
                    groupElement.appendChild(L.DomUtil.create('br'));
                });
                return groupElement;
            };

            _.forEach(this._layerData, (layerGroup) => {
                form.appendChild(createGroupElements(layerGroup));
            });

            this._zoomListener();
        },
        _getLayerBlockRule: function(layer) {
            if (layer.minZoom !== undefined && layer.minZoom > this._zoom) {
                return "Zoom in to use."
            } else if (layer.maxZoom !== undefined && layer.maxZoom < this._zoom) {
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
                    var titleString = layerWrapper.name;
                    if (layerBlockRule !== null) {
                        titleString = titleString + ": Disabled -1 " + layerBlockRule;
                    }
                    layerWrapper.element.title = titleString;
                    layerWrapper.label.title = titleString;
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

            // Temporary PoF Layers - Thanks to ThatShaman
            var overrideMaps = ["Crystal Oasis", "Desert Highlands", "Elon Riverlands", "The Desolation", "Domain of Vabbi"];
            if (_(overrideMaps).indexOf(gameMap.name) !== -1) {
                var imageUrl = "images/" + gameMap.name.toLowerCase().replace(/\s/g, '') + ".jpg";
                var baseBounds = gameMap.continent_rect;
                var bounds = [unproject(baseBounds[0]), unproject(baseBounds[1])];
                L.imageOverlay(imageUrl, bounds).addTo(map);
            }


            var marker = null;
            // Process POIs (Landmarks, Vistas, Waypoints)
            _.forEach(gameMap.points_of_interest, (poi) => {
                if (poi.type === "waypoint") {
                    marker = L.marker(unproject(poi.coord), {
                        title: poi.name,
                        icon: icons.waypoint,
                        type: poi.type
                    });
                    marker.bindPopup(generatePopupWithSearchIcons(poi.name, "waypoint", poi.chat_link));
                    waypointLayer.addLayer(marker);
                } else if (poi.type === "landmark") {
                    marker = L.marker(unproject(poi.coord), {
                        title: poi.name,
                        icon: icons.landmark,
                        type: poi.type
                    });
                    marker.bindPopup(generatePopupWithSearchIcons(poi.name, "poi", poi.chat_link));
                    landmarkLayer.addLayer(marker);
                } else if (poi.type === "vista") {
                    marker = L.marker(unproject(poi.coord), {
                        title: "Vista",
                        icon: icons.vista,
                        type: poi.type
                    });
                    marker.bindPopup(generatePopupWithSearchIcons(gameMap.name + " Vista", "vista", poi.chat_link));
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
                } else if (gameMap.customData.zoneCategory === "PoF") {
                    marker = L.marker(unproject(masteryPoint.coord), {
                        title: "Mastery Point (Crystal Desert)",
                        icon: icons.masterycrystal,
                        type: "mastery",
                        subtype: "crystal"
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
                } else if (gameMap.customData.zoneCategory === "HoT" || gameMap.customData.zoneCategory === "PoF") {
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


    var prepReadme = function() {
        return fetch("../user_readme.md")
            .then((readmeRequestResponse) => {
                return readmeRequestResponse.text();
            })
            .then((readmeMarkdown) => {
                var converter = new showdown.Converter();
                var html = converter.makeHtml(readmeMarkdown);
                var readmeDialog = L.control.dialog({
                        initOpen: false
                    })
                  .setContent("<p>" + html + "</p>")
                  .addTo(map);

                L.easyButton("&quest;", function(btn, map){
                    readmeDialog.open();
                }).addTo(map);
            })
    };
    prepReadme();
})();
