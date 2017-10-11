/*globals L _ fetch console showdown Clipboard Brushstroke Logging*/
/*eslint-env jquery */
((() => {
    let DEBUG = true;
    let DEBUG_ZONEBOXES = false;

    let logger = Logging.colorConsole();
    if (DEBUG) {
        logger.setLevel('debug');
    } else {
        logger.setLevel('warning');
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./js/mapdata-service-worker.js');
      logger.debug('Service worker registered...');
    }

    new Clipboard('.chatlink');

    const LABEL_FONT_AVG_RATIO = .6;
    let LABEL_FONT_HEIGHT = 18; // Default Value
    {
        const styleSheets = this.document.styleSheets;
        let appCSS = _.find(styleSheets, (o) => {return o.href.endsWith("/css/app.css")});
        console.log(appCSS);
    }

    /**
     * This is an attempt to encapsulate the zoom awareness functionality into it's own class.
     * 
     * The lifecycle is:
     * - A layer is created
     * - The LayerZoomMonitor is created
     * - Any user control for the layer affects the enabled value - via enable() or disable()
     * - Any zoom event goes to the registered event listener, which gets the new zoom
     * - On any event that would change the layer's status, we determine what the visibility should be and add/remove as necessary
     * 
     */
    class LayerZoomMonitor {
        constructor(layer, name, minZoom, maxZoom, map, enabled, layerModifier) {
          this.layer = layer
          this.name = name;
          this.minZoom = minZoom;
          this.maxZoom = maxZoom;
          this.map = map;
          this.enabled = enabled;
          this.layerModifier = layerModifier;

          this.map.on('zoomend', (event) => {this._zoomListener(event);});
          this._zoom = this.map.getZoom();
          this.updateLayerState();
        }

        enable() {
            this.enabled = true;
            this.updateLayerState();
        }
        disable() {
            this.enabled = false;
            this.updateLayerState();
        }

        isLayerEnabled() {
            return this.enabled;
        }

        isLayerBlocked() {
            return this.getBlockRule() === null;
        }

        isLayerOnMap() {
            return map.hasLayer(this.layer);
        }

        getBlockRule() {
            if (this.minZoom && this.minZoom > this._zoom) {
                return "Zoom in to use."
            } else if (this.maxZoom && this.maxZoom < this._zoom) {
                return "Zoom out to use."
            } else {
                return null;
            }
        }

        updateLayerState() {
            if (this.isLayerOnMap()) {
                if (!this.isLayerEnabled() || this.isLayerBlocked()) {
                    // The layer should not apply to the map, but is already on there, remove it
                    map.removeLayer(this.layer);
                    logger.debug(`Removed layer: ${this.name}`);
                }
            } else {
                if (this.isLayerEnabled() && !this.isLayerBlocked()) {
                    // The layer should apply but is not on the map, add it
                    map.addLayer(this.layer);
                    logger.debug(`Added layer: ${this.name}`);
                    this.layerModifier(this._zoom);
                }
            }
        }

        _zoomlistener() {
            return (event) => {
                logger.debug(`Map zoom event detected in manager for layer ${this.name}...`);
                this._zoom = this.map.getZoom();
                this.updateLayerState();
            };
        }
      }
      




    const generateIconV2URL = (type, subtype) => `images/gw2/v2/${type}${subtype !== undefined ? "-" + subtype : ""}.svg`;

    const generatePopupWithSearchIcons = (objDesc, objType, objChatLink) => {
        const span = document.createElement("span");
        const links = {};
        links.youtube = `https://www.youtube.com/results?search_query=gw2+${objDesc.replace(" ", "+")}`;
        links.google = `https://www.google.com/search?q=gw2+${objDesc.replace(" ", "+")}`;
        if (objType !== undefined) {
            links.youtube = `${links.youtube}+${objType.replace(" ", "+")}`;
            links.google = `${links.google}+${objType.replace(" ", "+")}`;
        }
        let popupContents = '';
        popupContents += `<span>Task: ${objDesc}<br>`;
        if (objChatLink !== undefined && objChatLink !== null) {
            popupContents += `<i class="fa fa-clipboard chatlink popuplink" aria-hidden="true" data-clipboard-text=${objChatLink} title="Copy Chat Link to Clipboard"></i>&nbsp;`;
        }
        popupContents += `<a href="${links.youtube}" target="_blank"><i class="fa fa-youtube-play popuplink" style="color:rgb(255, 0, 0)" aria-hidden="true" title="Search on YouTube"></i></a>&nbsp;`;
        popupContents += `<a href="${links.google}" target="_blank"><i class="fa fa-google popuplink" style="color:rgb(66, 133, 244)" aria-hidden="true" title="Search on Google"></i></a>&nbsp;`;
        popupContents += '</span>';
        span.innerHTML = popupContents;
        return span;
    };

    const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });

    const getWorldData = () => fetch("../data/zonedata.json")
        .then((worldDataRequestResponse) => {
            return worldDataRequestResponse.text();
        })
        .then((worldDataRaw) => {
            return JSON.parse(worldDataRaw);
        });

    const icons = {};
    icons.waypoint = L.icon({
        iconUrl: generateIconV2URL("waypoint"),
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [-3, -3]
    });
    icons.landmark = L.icon({
        iconUrl: generateIconV2URL("poi"),
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [-3, -3]
    });
    icons.vista = L.icon({
        iconUrl: generateIconV2URL("vista"),
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [-3, -3]
    });
    icons.masterytyria = L.icon({
        iconUrl: generateIconV2URL("mastery", "core"),
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [-3, -3]
    });
    icons.masterymaguuma = L.icon({
        iconUrl: generateIconV2URL("mastery", "hot"),
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [-3, -3]
    });
    icons.masterycrystal = L.icon({
        iconUrl: generateIconV2URL("mastery", "pof"),
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [-3, -3]
    });
    icons.masterygeneric = L.icon({
        iconUrl: generateIconV2URL("mastery", "generic"),
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [-3, -3]
    });
    icons.skillcore = L.icon({
        iconUrl: generateIconV2URL("heropoint", "1x"),
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [-3, -3]
    });
    icons.skillmaguuma = L.icon({
        iconUrl: generateIconV2URL("heropoint", "10x"),
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [-3, -3]
    });
    icons.task = L.icon({
        iconUrl: generateIconV2URL("task"),
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [-3, -3]
    });

    const unproject = coord => map.unproject(coord, map.getMaxZoom());

    var map;
    map = L.map("map", {
        minZoom: 1,
        maxZoom: 7,
        crs: L.CRS.Simple,
        preferCanvas: true
    }).setView([0, 0], 0);

    const southWest = unproject([0, 40000]);
    const northEast = unproject([40000, 0]);
    const maxBounds = new L.LatLngBounds(southWest, northEast);

    map.setMaxBounds(maxBounds);

    const createWebImageryLayer = floorId => {
        const baseLayerURL = `https://tiles{s}.guildwars2.com/1/${floorId}/{z}/{x}/{y}.jpg`;
        const imageryLayer = L.tileLayer(baseLayerURL, {
            minZoom: 0,
            maxZoom: 7,
            bounds: maxBounds,
            attribution: 'Map data and imagery &copy; <a href="https://www.arena.net/" target="_blank">ArenaNet</a>',
            subdomains: [1, 2, 3, 4]
        });
        return imageryLayer;
    };


    const baseMaps = {};
    const floorNames = ["Underground", "Surface", "Upper Level", "Depths"];
    // Force in Upper Level, Surface, Underground, Depths order :)
    _.forEach([2, 1, 0, 3], (floorId) => {
        const layer = createWebImageryLayer(floorId);
        baseMaps[floorNames[floorId]] = layer;
    });
    map.addLayer(baseMaps.Surface);

    const vistaLayer = new L.LayerGroup();
    const landmarkLayer = new L.LayerGroup();
    const waypointLayer = new L.LayerGroup();
    const masteryLayer = new L.LayerGroup();
    const zoneLayer = new L.LayerGroup();
    const taskLayer = new L.LayerGroup();
    const heroLayer = new L.LayerGroup();
    const markersLayer = new L.LayerGroup([
        waypointLayer,
        landmarkLayer,
        masteryLayer,
        vistaLayer,
        taskLayer,
        heroLayer
    ]);

    const controlSearch = new L.Control.Search({
        position: 'topleft',
        layer: markersLayer,
        initial: false,
        zoom: 7,
        marker: false,
        buildTip: (text, val) => {
            const layerOpts = val.layer.options;
            return `<a href="#"><img src="${generateIconV2URL(layerOpts.type, layerOpts.subtype)}" height=16 width=16 />${text}</a>`;
        }
    });
    map.addControl(controlSearch);

    const layers = [
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
                    "icon": generateIconV2URL("waypoint"),
                    "display": "iconOnly",
                    "minZoom": 2,
                    "defaultState": true
                },
                {
                    "name": "Vistas",
                    "layer": vistaLayer,
                    "icon": generateIconV2URL("vista"),
                    "display": "iconOnly",
                    "minZoom": 3,
                    "defaultState": true
                },
                {
                    "name": "Landmarks",
                    "layer": landmarkLayer,
                    "icon": generateIconV2URL("poi"),
                    "display": "iconOnly",
                    "minZoom": 3,
                    "defaultState": true
                },
                {
                    "name": "Mastery Points",
                    "layer": masteryLayer,
                    "icon": generateIconV2URL("mastery", "generic"),
                    "display": "iconOnly",
                    "minZoom": 4,
                    "defaultState": false
                },
                {
                    "name": "Hero Challenges",
                    "layer": heroLayer,
                    "icon": generateIconV2URL("heropoint", "1x"),
                    "display": "iconOnly",
                    "minZoom": 4,
                    "defaultState": false
                },
                {
                    "name": "Tasks",
                    "layer": taskLayer,
                    "icon": generateIconV2URL("task"),
                    "display": "iconOnly",
                    "minZoom": 4,
                    "defaultState": false
                },
                {
                    "name": "Labels",
                    "layer": zoneLayer,
                    "icon": generateIconV2URL("labels"),
                    "display": "iconOnly",
                    "minZoom": 2,
                    "maxZoom": 5,
                    "defaultState": true
                }
            ]
        }
    ];

    L.Control.ImprovedLayerControl = L.Control.extend({
        _zoomListener(event) {
            logger.debug('Map zoom event detected...');
            this._zoom = map.getZoom();
            this._update();
        },
        _changeListener(event) {
            logger.debug('Layer selection change detected...');
            this._updateLayerVisibility();
        },
        _map: null,
        _zoom: null,
        initialize(options) {
          this._layerData = options.layerData;
        },
        onAdd(map) {
            this._initLayout();

            this._map = map;
            map.on('zoomend', (event) => {this._zoomListener(event);});
            return this._container;
        },
        onRemove(map) {
            map.off('zoomend', (event) => {this._zoomListener(event);});
            this._map = null;
        },
        _update() {
            this._updateLayerVisibility();
            this._updateLayout();
        },
        _initLayout() {
            const className = 'leaflet-smart-layer-control';
            const container = this._container = L.DomUtil.create('div', className);// + ' leaflet-bar leaflet-control leaflet-control-custom');

            // Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
            container.setAttribute('aria-haspopup', true);

            if (L.Browser.touch) {
                L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
            } else {
                L.DomEvent.disableClickPropagation(container);
                L.DomEvent.on(container, 'wheel', L.DomEvent.stopPropagation);
            }

            const form = this._form = L.DomUtil.create('form', `${className}-list`);
            container.appendChild(form);

            const createTitle = (name) => {
                const titleDiv = L.DomUtil.create('div', 'layermanager-list-group-title');
                titleDiv.textContent = name;
                return titleDiv;
            };

            const createGroupElements = (layerGroup) => {
                const groupElement = L.DomUtil.create('div', 'layermanager-list-group');
                groupElement.appendChild(createTitle(layerGroup.groupName));
                if (layerGroup.type === "layeroption") {
                    groupElement.style = "margin-bottom: 25px";   
                }

                let layerIdx = null;
                _.forEach(layerGroup.layers, (layerWrapper) => {
                    layerWrapper.trackingId = uuidv4();
                    let layerControlElement = null;
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
                        layerControlElement.style = `top: ${(layerIdx + 1) * 20}px;z-index:${layerIdx}`;
                    }
                    layerControlElement.name = layerGroup.name;
                    layerControlElement.id = layerWrapper.trackingId;
                    layerControlElement.value = layerWrapper.name;
                    if (layerWrapper.defaultState === true) {
                        layerControlElement.checked = true;
                    }
                    layerWrapper.element = layerControlElement;
                    layerControlElement.addEventListener('change', (event) => {this._changeListener(event);});
                    groupElement.appendChild(layerControlElement);

                    let layerLabel = null;
                    if (layerWrapper.display === "iconOnly") {
                        layerLabel = L.DomUtil.create('label', 'layermanager-list-iconlabel');
                        layerLabel.htmlFor = layerWrapper.trackingId;
                        const iconElement = L.DomUtil.create('img');
                        iconElement.src = layerWrapper.icon;
                        iconElement.height = 32;
                        iconElement.width = 32;
                        iconElement.title = layerWrapper.name;
                        iconElement.alt = layerWrapper.name;
                        if (layerIdx !== null) {
                            iconElement.style = `top: ${(layerIdx + 1) * 20}px;z-index:${layerIdx}`;
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
        _getLayerBlockRule(layer) {
            if (layer.minZoom !== undefined && layer.minZoom > this._zoom) {
                return "Zoom in to use."
            } else if (layer.maxZoom !== undefined && layer.maxZoom < this._zoom) {
                return "Zoom out to use."
            } else {
                return null;
            }
        },
        _updateLayout() {
            _.forEach(this._layerData, (layerGroup) => {
                _.forEach(layerGroup.layers, (layerWrapper) => {
                    const layerBlockRule = this._getLayerBlockRule(layerWrapper);
                    layerWrapper.element.disabled = (layerBlockRule !== null);
                    let titleString = layerWrapper.name;
                    if (layerBlockRule !== null) {
                        titleString = `${titleString}: Disabled -1 ${layerBlockRule}`;
                    }
                    layerWrapper.element.title = titleString;
                    layerWrapper.label.title = titleString;
                });
            });
        },
        _updateLayerVisibility() {
            _.forEach(this._layerData, (layerGroup) => {
                _.forEach(layerGroup.layers, (layerWrapper) => {
                    const layerBlockRule = this._getLayerBlockRule(layerWrapper);
                    const applyLayer = (layerWrapper.element.checked && layerBlockRule === null);
                    const layerOnMap = map.hasLayer(layerWrapper.layer);

                    if (applyLayer && !layerOnMap) {
                        // The layer should apply and is not on the map, add it
                        logger.debug(`Adding layer: ${layerWrapper.name}`);
                        map.addLayer(layerWrapper.layer);
                    } else if (!applyLayer && layerOnMap) {
                        // The layer should not apply to the map, but is already on there, remove it
                        logger.debug(`Removing layer: ${layerWrapper.name}`);
                        map.removeLayer(layerWrapper.layer);
                    }
                    // Otherwise, no action is necessary
                });
            });
        }
    });

    L.control.improvedLayerControl = opts => new L.Control.ImprovedLayerControl(opts)
    L.control.improvedLayerControl({ "layerData" : layers }).addTo(map);

    // Load World Data
    getWorldData().then(worldData => {
        _.forOwn(worldData, gameMap => {
            let marker = null;
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
                    marker.bindPopup(generatePopupWithSearchIcons(`${gameMap.name} Vista`, "vista", poi.chat_link));
                    vistaLayer.addLayer(marker);
                } else {
                    logger.warning(`unknown poi type: ${poi.type}`);
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
                } else if (gameMap.customData.zoneCategory === "HoT") {
                    marker = L.marker(unproject(masteryPoint.coord), {
                        title: "Mastery Point (Maguuma)",
                        icon: icons.masterymaguuma,
                        type: "mastery",
                        subtype: "maguuma"
                    });
                } else if (gameMap.customData.zoneCategory === "PoF") {
                    marker = L.marker(unproject(masteryPoint.coord), {
                        title: "Mastery Point (Crystal Desert)",
                        icon: icons.masterycrystal,
                        type: "mastery",
                        subtype: "crystal"
                    });
                } else {
                    marker = L.marker(unproject(masteryPoint.coord), {
                        title: "Mastery Point (???)",
                        icon: icons.masterygeneric,
                        type: "mastery",
                        subtype: "unknown"
                    });
                    logger.warning(`unknown mastery region: ${gameMap.customData.region.name}; displaying generic...`);
                }
                masteryLayer.addLayer(marker);
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
                } else if (gameMap.customData.zoneCategory === "HoT" || gameMap.customData.zoneCategory === "PoF") {
                    marker = L.marker(unproject(skillChallenge.coord), {
                        title: "Hero Challenge (10x)",
                        icon: icons.skillmaguuma,
                        type: "hero_point",
                        subtype: "advanced"
                    });
                } else {
                    marker = L.marker(unproject(skillChallenge.coord), {
                        title: "Hero Challenge (???)",
                        icon: icons.skillcore,
                        type: "hero_point",
                        subtype: "core"
                    });
                    logger.warning(`unknown skill challenge region: ${gameMap.customData.region.name}; displaying generic...`);
                }
                heroLayer.addLayer(marker);
            });

            // Process Hearts / Tasks
            marker = null;
            _.forEach(gameMap.tasks, (task) => {
                marker = L.marker(unproject(task.coord), {
                    title: `Task: ${task.objective}`,
                    icon: icons.task,
                    type: "task"
                });
                marker.bindPopup(generatePopupWithSearchIcons(task.objective, "heart"));
                taskLayer.addLayer(marker);
            });

            // Debug - zone boxes
            if (DEBUG_ZONEBOXES) {
                const baseBounds = gameMap.continent_rect;
                const bounds = [unproject(baseBounds[0]), unproject(baseBounds[1])];
                const zonerect = L.rectangle(bounds, {
                    color: gameMap.customData.assignedColor,
                    weight: 1,
                    feature: {
                        properties: {
                        name: gameMap.customData.name
                        }
                    }
                });
                zoneLayer.addLayer(zonerect);
            }

            // Add zone label
            const labelPos = unproject(gameMap.label_coord);
            /*const FONT_AVG_RATIO = .6;
            const FONT_HEIGHT 
            labelPos[0] = labelPos[0] - (gameMap.name * )*/
            var divIcon = L.divIcon({
                html: gameMap.name,
                className: "zone-label"
            });
            marker = new L.marker(labelPos, {icon: divIcon});
            zoneLayer.addLayer(marker);
        });
    }).catch(ex => {
        logger.error("Failed to read map data: ", ex);
    });

    const prepReadme = () => fetch("../user_readme.md")
        .then((readmeRequestResponse) => {
            return readmeRequestResponse.text();
        })
        .then((readmeMarkdown) => {
            const converter = new showdown.Converter();
            const html = converter.makeHtml(readmeMarkdown);
            document.getElementById("modal-body").innerHTML = `<p>${html}</p>`;
            L.easyButton("&quest;", (btn, map) => {
                $('#helpModal').modal({ backdrop: false}); // Disable backdrop due to incompatibility
            }).addTo(map);
            logger.debug('Readme loaded and prepared...');
        })
        .catch(ex => {
            logger.error("Failed to read readme data: ", ex);
        });;
    prepReadme();


    function getRandomIntInclusive(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
    }

    const paintElementArea = (element, paintMargin, color) => {
        let optionsBackground = {
            animation: 'points',
            points: 100,
            inkAmount: 15,
            tension: 0.4,
            size: 14,
            frames: 5,
            frameAnimation: false,
            color,
            splashing: false,
            dripping: true,
            centered: true,
            queue: true,
            width: element.offsetWidth,
            height: element.offsetHeight,
            root: element
        };
        let bsBackground = new Brushstroke(optionsBackground);

        let position = element.offsetLeft + paintMargin;
        while (position < element.offsetLeft + element.offsetWidth) {
            bsBackground.draw({
                points: [position + getRandomIntInclusive(-3, 3), (paintMargin + getRandomIntInclusive(-3, 3)), position + getRandomIntInclusive(-3, 3), element.offsetHeight - (paintMargin + getRandomIntInclusive(-3, 3))]
            });
            position = position + 2;
        }
    };

    paintElementArea(document.getElementsByClassName('leaflet-smart-layer-control')[0], 8, '#A0522D');
}))();
