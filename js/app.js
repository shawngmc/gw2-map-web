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

var mapIds = [
    15,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    37,
    38,
    39,
    50,
    51,
    53,
    54,
    55,
    61,
    62,
    63,
    64,
    65,
    66,
    67,
    68,
    69,
    70,
    71,
    73,
    75,
    76,
    77,
    79,
    80,
    81,
    82,
    89,
    91,
    92,
    95,
    96,
    97,
    110,
    111,
    112,
    113,
    120,
    138,
    139,
    140,
    142,
    143,
    144,
    145,
    147,
    148,
    149,
    152,
    153,
    154,
    157,
    159,
    161,
    162,
    163,
    171,
    172,
    178,
    179,
    180,
    182,
    184,
    185,
    186,
    190,
    191,
    192,
    193,
    195,
    196,
    198,
    199,
    200,
    201,
    202,
    203,
    211,
    212,
    215,
    216,
    217,
    218,
    222,
    224,
    225,
    226,
    232,
    234,
    237,
    238,
    239,
    242,
    244,
    248,
    249,
    250,
    251,
    252,
    254,
    255,
    256,
    257,
    258,
    259,
    260,
    262,
    263,
    264,
    267,
    269,
    271,
    272,
    274,
    275,
    276,
    282,
    283,
    284,
    287,
    288,
    290,
    294,
    295,
    297,
    326,
    327,
    330,
    334,
    336,
    350,
    363,
    364,
    365,
    371,
    372,
    373,
    374,
    375,
    376,
    378,
    379,
    380,
    381,
    382,
    385,
    386,
    387,
    388,
    389,
    390,
    391,
    392,
    393,
    394,
    396,
    397,
    399,
    400,
    401,
    405,
    407,
    410,
    411,
    412,
    413,
    414,
    415,
    416,
    417,
    418,
    419,
    420,
    421,
    422,
    423,
    424,
    425,
    427,
    428,
    429,
    430,
    432,
    434,
    435,
    436,
    439,
    440,
    441,
    444,
    447,
    449,
    453,
    454,
    455,
    458,
    459,
    460,
    464,
    465,
    466,
    470,
    471,
    474,
    476,
    477,
    480,
    481,
    483,
    485,
    487,
    488,
    489,
    490,
    492,
    496,
    497,
    498,
    499,
    502,
    503,
    504,
    505,
    507,
    509,
    511,
    512,
    513,
    514,
    515,
    516,
    517,
    518,
    519,
    520,
    521,
    522,
    523,
    524,
    525,
    527,
    528,
    529,
    532,
    533,
    534,
    535,
    536,
    537,
    538,
    539,
    540,
    542,
    543,
    544,
    545,
    546,
    547,
    548,
    549,
    552,
    554,
    556,
    557,
    558,
    559,
    560,
    561,
    563,
    564,
    566,
    567,
    569,
    570,
    571,
    573,
    574,
    575,
    576,
    577,
    578,
    579,
    581,
    582,
    583,
    584,
    586,
    587,
    588,
    589,
    590,
    591,
    592,
    594,
    595,
    596,
    597,
    598,
    599,
    606,
    607,
    608,
    609,
    610,
    611,
    613,
    614,
    617,
    618,
    619,
    620,
    621,
    622,
    623,
    624,
    625,
    627,
    628,
    629,
    630,
    631,
    633,
    634,
    635,
    636,
    638,
    639,
    642,
    643,
    644,
    645,
    646,
    647,
    648,
    649,
    650,
    651,
    652,
    653,
    654,
    655,
    656,
    657,
    658,
    659,
    660,
    662,
    663,
    664,
    666,
    667,
    668,
    669,
    670,
    672,
    673,
    674,
    675,
    676,
    677,
    678,
    680,
    681,
    682,
    683,
    684,
    685,
    686,
    687,
    691,
    692,
    693,
    694,
    695,
    696,
    697,
    698,
    699,
    700,
    701,
    702,
    703,
    704,
    705,
    706,
    707,
    708,
    709,
    710,
    711,
    712,
    713,
    714,
    715,
    716,
    719,
    726,
    727,
    728,
    729,
    730,
    731,
    732,
    733,
    735,
    736,
    737,
    738,
    739,
    743,
    744,
    745,
    746,
    747,
    750,
    751,
    758,
    760,
    761,
    762,
    763,
    764,
    766,
    767,
    768,
    769,
    772,
    775,
    776,
    777,
    778,
    779,
    780,
    781,
    782,
    783,
    784,
    785,
    786,
    787,
    788,
    789,
    790,
    792,
    793,
    795,
    796,
    797,
    799,
    806,
    807,
    820,
    821,
    825,
    827,
    828,
    830,
    833,
    845,
    849,
    863,
    864,
    865,
    866,
    872,
    873,
    875,
    877,
    878,
    880,
    881,
    882,
    894,
    895,
    896,
    897,
    899,
    900,
    905,
    911,
    914,
    918,
    919,
    920,
    921,
    924,
    929,
    930,
    933,
    934,
    935,
    936,
    938,
    939,
    940,
    943,
    944,
    945,
    946,
    947,
    948,
    949,
    950,
    951,
    952,
    953,
    954,
    955,
    956,
    957,
    958,
    959,
    960,
    961,
    963,
    964,
    968,
    969,
    971,
    980,
    984,
    988,
    989,
    990,
    991,
    992,
    993,
    994,
    997,
    998,
    999,
    1000,
    1001,
    1002,
    1003,
    1004,
    1005,
    1006,
    1007,
    1008,
    1009,
    1010,
    1011,
    1015,
    1016,
    1017,
    1018,
    1021,
    1022,
    1023,
    1024,
    1025,
    1026,
    1027,
    1028,
    1029,
    1032,
    1033,
    1037,
    1040,
    1041,
    1042,
    1043,
    1045,
    1046,
    1048,
    1050,
    1051,
    1052,
    1054,
    1057,
    1058,
    1062,
    1063,
    1064,
    1065,
    1066,
    1067,
    1068,
    1069,
    1070,
    1071,
    1072,
    1073,
    1074,
    1075,
    1076,
    1078,
    1079,
    1080,
    1081,
    1082,
    1083,
    1084,
    1086,
    1087,
    1088,
    1089,
    1090,
    1091,
    1092,
    1093,
    1094,
    1095,
    1097,
    1098,
    1099,
    1100,
    1101,
    1104,
    1105,
    1106,
    1107,
    1108,
    1109,
    1110,
    1111,
    1112,
    1113,
    1115,
    1116,
    1117,
    1118,
    1121,
    1122,
    1123,
    1124,
    1125,
    1126,
    1128,
    1129,
    1130,
    1131,
    1132,
    1133,
    1134,
    1135,
    1136,
    1137,
    1138,
    1139,
    1140,
    1142,
    1144,
    1146,
    1147,
    1149,
    1153,
    1154,
    1155,
    1156,
    1158,
    1159,
    1161,
    1163,
    1164,
    1165,
    1166,
    1167,
    1169,
    1170,
    1171,
    1172,
    1173,
    1175,
    1176,
    1177,
    1178,
    1180,
    1181,
    1182,
    1185,
    1188,
    1189,
    1190,
    1191,
    1192,
    1193,
    1194,
    1195,
    1196,
    1198,
    1200,
    1202,
    1203,
    1204,
    1205,
    1206,
    1207,
    1208,
    1210,
    1217,
    1246
];

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
    //var zoneLayer = new L.LayerGroup();
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
        "Waypoints": waypointLayer,
    //   "Zones": zoneLayer
    };

    L.control.layers(baseMaps, overlayMaps).addTo(map);

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

                var marker = null;
                // Process POIs (Landmarks, Vistas, Waypoints)                    
                _.forEach(gameMap.points_of_interest, function (poi) {
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
                _.forEach(gameMap.mastery_points, function (masteryPoint) {
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
    })
        .catch(function (ex) {
            console.log('failed', ex);
        });

    var zones = [];

    // Load World Zone Definitions
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
