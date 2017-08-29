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

function unproject(coord) {
    return map.unproject(coord, map.getMaxZoom());
}

function onMapClick(e) {
    console.log("You clicked the map at " + map.project(e.latlng));
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
	var markersLayer = new L.LayerGroup([
        	waypointLayer,
		landmarkLayer,
        	vistaLayer
	]);

	var controlSearch = new L.Control.Search({
		position:'topleft',		
		layer: markersLayer,
		initial: false,
		zoom: 7,
		marker: false,
		buildTip: function(text, val) {
			return '<a href="#"><img src="images/'+ val.layer.options.type+'.png" height=16 width=16 />'+text+'</a>';
		}
	});
	map.addControl( controlSearch );



var baseMaps = {
    "Imagery": imageryLayer 
};

var overlayMaps = {
    "Landmarks": landmarkLayer,
    "Vistas": vistaLayer,
    "Waypoints": waypointLayer
};

L.control.layers(baseMaps, overlayMaps).addTo(map);
  
    $.getJSON("https://api.guildwars2.com/v1/map_floor.json?continent_id=1&floor=1", function (data) {
        var region, gameMap, i, il, poi;
        
        for (region in data.regions) {
            region = data.regions[region];
            
            for (gameMap in region.maps) {
                gameMap = region.maps[gameMap];
                
                for (i = 0, il = gameMap.points_of_interest.length; i < il; i++) {
                    poi = gameMap.points_of_interest[i];
                    
                    var marker = null;
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
                            title:'Unnamed Vista',
                            icon: icons.vista,
                            type: poi.type
                        });
                        vistaLayer.addLayer(marker);
                    } else {
                        console.log('unknown poi type: ' + poi.type);
                    }
                
                    if (marker != null) {
                    } else {
                        continue;
                    }
                }
            }
        }
    });
});