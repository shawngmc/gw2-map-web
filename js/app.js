var map;

var icons = {};
icons.waypoint = L.icon({
    iconUrl: 'images/waypoint.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [-3, -3]
});
icons.landmark = L.icon({
    iconUrl: 'images/landmark.png',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [-3, -3]
});
icons.vista = L.icon({
    iconUrl: 'images/vista.png',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [-3, -3]
});
icons.masterytyria = L.icon({
    iconUrl: 'images/mastery_core.gif',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [-3, -3]
});
icons.masterymaguuma = L.icon({
    iconUrl: 'images/mastery_maguuma.gif',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [-3, -3]
});
icons.masterygeneric = L.icon({
    iconUrl: 'images/mastery_unknown.png',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [-3, -3]
});

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

$(function () {
    "use strict";

    var southWest, northEast;

    map = L.map("map", {
        minZoom: 0,
        maxZoom: 7,
        crs: L.CRS.Simple
    }).setView([0, 0], 0);

    southWest = unproject([0, 32768]);
    northEast = unproject([32768, 0]);

    map.setMaxBounds(new L.LatLngBounds(southWest, northEast));

    var imageryLayer = L.tileLayer("https://tiles.guildwars2.com/1/1/{z}/{x}/{y}.jpg", {
        minZoom: 0,
        maxZoom: 7,
        attribution: 'Map data and imagery &copy; <a href="https://www.arena.net/" target="_blank">ArenaNet</a>'
    });
    map.addLayer(imageryLayer);

    map.on("click", onMapClick);


    var vistaLayer = new L.LayerGroup();
    var landmarkLayer = new L.LayerGroup();
    var waypointLayer = new L.LayerGroup();
    var masteryLayer = new L.LayerGroup();
    var markersLayer = new L.LayerGroup([
        waypointLayer,
        landmarkLayer,
        masteryLayer,
        vistaLayer
    ]);

    var controlSearch = new L.Control.Search({
        position: 'topleft',
        layer: markersLayer,
        initial: false,
        zoom: 7,
        marker: false,
        buildTip: function (text, val) {
            return '<a href="#"><img src="images/' + val.layer.options.type + '.png" height=16 width=16 />' + text + '</a>';
        }
    });
    map.addControl(controlSearch);



    var baseMaps = {};

    var overlayMaps = {
        "Landmarks": landmarkLayer,
        "Mastery Points": masteryLayer,
        "Vistas": vistaLayer,
        "Waypoints": waypointLayer
    };

    L.control.layers(baseMaps, overlayMaps).addTo(map);

    $.ajax({
        url: "https://api.guildwars2.com/v2/continents/1/floors/1",
        success: function (data) {
            var region, gameMap, poi;

            for (region in data.regions) {
                region = data.regions[region];
                _.forEach(region.maps, function (gameMap) {
                    
                    var marker = null;
                    // Process POIs (Landmarks, Vistas, Waypoints)                    
                    _.forEach(gameMap.points_of_interest, function(poi) {
                        if (poi.type === "waypoint") {
                            marker = L.marker(unproject(poi.coord), {
                                title: poi.name,
                                icon: icons.waypoint,
                                type: poi.type
                            });
                            marker.bindPopup(poi.name);
                            waypointLayer.addLayer(marker);
                        } else if (poi.type === "landmark") {
                            marker = L.marker(unproject(poi.coord), {
                                title: poi.name,
                                icon: icons.landmark,
                                type: poi.type
                            });
                            marker.bindPopup(poi.name);
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
                    _.forEach(gameMap.mastery_points, function(masteryPoint) {
                        var zoneset = getZoneSet(region.name);
                        if (zoneset === "Tyria") {
                            marker = L.marker(unproject(masteryPoint.coord), {
                                title: 'Mastery Point (Tyria)',
                                icon: icons.masterytyria,
                                type: "mastery_point"
                            });
                            masteryLayer.addLayer(marker);
                        } else if (zoneset === "Maguuma") {
                            marker = L.marker(unproject(masteryPoint.coord), {
                                title: 'Mastery Point (Maguuma)',
                                icon: icons.masterymaguuma,
                                type: "mastery_point"
                            });
                            masteryLayer.addLayer(marker);
                        } else {
                            marker = L.marker(unproject(masteryPoint.coord), {
                                title: 'Mastery Point (???)',
                                icon: icons.masterygeneric,
                                type: "mastery_point"
                            });
                            masteryLayer.addLayer(marker);
                            console.log('unknown mastery region: ' + region.name + "; displaying generic...");
                        }
                    });
                });
            }
        }
    });
});