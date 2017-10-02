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
    1211: { "name": "Desert Highlands", "type": "Story", "zoneCategory": "PoF" },
    1214: { "name": "Windswept Haven", "type": "Guild Hall", "zoneCategory": "PoF" },
    1226: { "name": "The Desolation", "type": "Story", "zoneCategory": "PoF" },
    1228: { "name": "Elon Riverlands", "type": "Story", "zoneCategory": "PoF" },
    1248: { "name": "Domain of Vabbi", "type": "Story", "zoneCategory": "PoF" },
};

/*
 * Locations for cross-world map travel. Coordinates are ordered by progression.
 */
var gateways = {
	// The light blue vortexes at the edges of zones
	interborders: [
	[[877, 16061], [790, 16219]], // verdant to auric
	[[2394, 18790], [2915, 18296]], // auric to tangled
	[[2902, 19509], [3776, 19771]], // tangled to dragon
	[[4155, 15495], [3750, 15250]], // silverwastes to verdant
	[[5974, 15604], [5865, 15283]], // brisban to silverwastes
	[[6039, 17105], [5559, 16744]], // brisban to dry
	[[8011, 17021], [8082, 17270]], // metrica to brisban
	[[9492, 14615], [9218, 14666]], // kessex to brisban
	[[9443, 16316], [9244, 16368]], // caledon to brisban
	[[10229, 20633], [9926, 20038]], // grove to caledon
	[[9130, 17658], [9435, 17664]], // metrica to caledon
	[[11061, 16191], [11090, 16023]], // caledon to kessex
	[[12232, 14028], [12234, 14141]], // kessex to queensdale
	[[10301, 14182], [10476, 13932]], // kessex to queensdale
	[[13353, 14230], [13561, 14110]], // kessex to gendarran
	[[11900, 10461], [12217, 10587]], // divinity to doric
	[[13385, 10069], [13623, 10120]], // doric to harathi
	[[11245, 11602], [11021, 11934]], // divinity to queensdale
	[[13327, 12613], [13523, 12681]], // queensdale to gendarran
	[[14344, 12335], [14341, 12140]], // gendarran to harathi
	[[15718, 12361], [15749, 12195]], // gendarran to harathi
	[[17487, 13631], [17758, 13600]], // gendarran to lornar
	[[17544, 12749], [17780, 12754]], //gendarran to snowden
	[[15879, 14217], [16119, 14380]], // gendarran to lion
	[[16823, 15764], [16767, 15921]], // lion to bloodtide
	[[17448, 15031], [17786, 15120]], // lion to lornar
	[[17545, 16082], [17784, 16001]], // bloodtide to lornar
	[[17602, 17798], [17795, 17828]], // bloodtide to lornar
	[[15542, 18835], [15529, 19192]], // bloodtide to sparkfly
	[[19344, 16580], [19618, 16380]], // lornar to dredgehaunt
	[[19035, 18066], [19184, 18273]], // lornar to timberline
	[[20665, 17971], [20618, 18243]], // dredgehaunt to timberline
	[[19107, 13401], [19178, 13188]], // snowden to lornar
	[[21645, 11577], [22032, 11797]], // snowden to wayfarer
	[[20977, 11386], [21044, 11204]], // snowden to frostgorge
	[[21428, 14519], [22148, 14491]], // hoelbrak to wayfarer
	[[21086, 14721], [20942, 15114]], // hoelbrak to dredgehaunt
	[[23110, 11450], [23061, 11163]], // wayfarer to frostgorge
	[[23356, 11968], [23680, 11995]], // wayfarer to diessa
	[[23706, 9704], [23993, 9741]], // frostgorge to fireheart
	[[21330, 8244], [21380, 8046]], // frostgorge to bitterfrost
	[[24301, 13685], [24090, 13465]], // citadel to diessa
	[[25049, 14227], [25270, 14411]], // citadel to plains
	[[26719, 13660], [26847, 13506]], // plains to diessa
	[[29104, 14842], [29269, 14884]], // plains to blazeridge
	[[28217, 13642], [28194, 13489]], // plains to marches
	[[30932, 16429], [30928, 16180]], // fields to blazeridge
	[[29314, 12615], [29103, 12452]], // blazeridge to marches
	[[27235, 10757], [27059, 10748]], // marches to fireheart
	[[19532, 21222], [19583, 21431]], // timberline to maelstrom
	[[17643, 21789], [17882, 21744]], // sparkfly to maelstrom
	[[16978, 22219], [16980, 22547]], // sparkfly to straits
	[[17870, 23464], [17679, 23537]], // maelstrom to straits
	[[14575, 24541], [14352, 24600]], // straits to malchor
	[[11926, 25129], [11731, 25347]] // malchor to cursed
	],
	// The purple asura gates that mostly connect cities
	interzones: [
	[[6114, 20837], [7281, 20046]], // rata to metrica
	[[6095, 20859], [5946, 21489]], // rata to incubationlab
	[[6073, 20856], [5514, 21765]], // rata to dawnsidequay
	[[5774, 20768], [5248, 19931]], // rata to applieddevelopmentlab
	[[5772, 20802], [5407, 20840]], // rata to snaffmemoriallab
	[[5796, 20806], [5290, 21885]], // rata to antidawnanchorage
	[[16646, 14662], [13872, 20331]], // lion to southsun
	[[16680, 14699], [20501, 14271]], // lion to hoelbrak
	[[16663, 14799], [24051, 14060]], // lion to citadel
	[[16621, 14815], [10450, 20912]], // lion to grove
	[[16550, 14759], [6003, 20530]], // lion to rata
	[[16592, 14666], [11341, 11005]], // lion to divinity
	[[11937, 10966], [29065, 18418]], // divinity to fields
	[[17390, 23393], [16706, 12619]], // forttrinity to vigilkeep
	[[17418, 23392], [16672, 16653]], // forttrinity to chantryofsecrets
	[[17442, 23401], [17815, 15000]] // forttrinity to durmandpriory
	],
	// Skritt Tunnels, Nuhoch Wallows, and other within zone teleports
	intrazones: [
	[[5754, 15219], [4929, 15359]], // silverwastes
	[[4942, 15550], [4429, 14751]], // silverwastes
	[[4730, 14951], [5205, 14296]], // silverwastes
	[[5063, 15002], [4319, 15337]], // silverwastes
	[[4815, 15589], [4784, 15606]], // silverwastes
	[[2028, 15461], [2082, 15597]], // verdant
	[[2778, 15132], [2778, 15201]], // verdant
	[[810, 17777], [1185, 18496]], // auric
	[[1423, 16995], [1470, 18080]], // auric
	[[1970, 18729], [2118, 17772]], // auric
	[[1060, 17395], [2286, 17520]], // auric
	[[965, 16732], [2030, 16413]], // auric
	[[1531, 16403], [2490, 17495]], // auric
	[[5090, 18256], [4609, 18419]], // tangled
	[[4371, 18477], [4328, 17935]], // tangled
	[[3854, 17666], [4323, 17881]], // tangled
	[[3873, 18618], [4264, 17881]], // tangled
	[[2940, 18530], [3571, 17704]], // tangled
	[[3606, 18087], [3743, 18275]], // tangled
	[[3631, 19087], [3538, 19162]], // tangled
	[[5101, 19099], [5152, 19007]], // tangled
	[[3721, 20383], [4149, 20777]] // dragon
	],
	// The circular pads or thermal tubes that cannonballs the player over the map
	launchpads: [
	{c: [[3291 ,25775], [3704, 26047]]}, // draconis
	{c: [[3839, 26015], [3906, 25608]]},
	{c: [[3906, 25608], [4640, 25692]]},
	{c: [[4507, 25396], [4708, 24977]]},
	{c: [[4706, 24890], [4511, 24813]]},
	{c: [[4505, 25271], [4125, 25285]]},
	{c: [[4058, 25279], [3446, 25017]]},
	{c: [[3291, 25774], [3704, 26047]]},
	{c: [[5081, 29125], [5261, 28883]]}, // ember
	{c: [[5100, 29397], [5456, 30042]]},
	{c: [[5275, 29520], [5081, 29125]]},
	{c: [[5457, 30042], [6074, 29718]]},
	{c: [[5501, 29895], [5275, 29520]]},
	{c: [[5770, 30532], [5456, 30044]]},
	{c: [[6049, 29316], [5501, 29897]]},
	{c: [[6073, 29718], [6242, 29374]]},
	{c: [[6162, 30119], [6073, 29718]]},
	{c: [[6200, 30230], [7052, 30403]]},
	{c: [[6216, 30103], [6423, 29888]]},
	{c: [[6242, 29374], [6505, 29536]]},
	{c: [[6387, 29286], [6021, 29313]]},
	{c: [[6423, 29888], [6850, 29999]]},
	{c: [[6505, 29536], [6535, 29093]]},
	{c: [[6574, 28954], [6985, 29132]]},
	{c: [[6813, 29739], [6508, 29537]]},
	{c: [[6822, 28872], [6694, 29200]]},
	{c: [[6860, 29092], [7005, 28800]]},
	{c: [[6986, 30318], [6310, 29799]]},
	{c: [[7005, 28905], [6607, 29185]]},
	{c: [[7047, 29484], [6505, 29536]]},
	{c: [[7089, 28731], [7299, 29043]]},
	{c: [[7299, 29043], [7926, 28981]]},
	{c: [[7394, 29416], [6927, 29988]]},
	{c: [[7544, 29690], [7047, 29484]]},
	{c: [[7926, 28981], [7927, 29466]]},
	{c: [[7927, 29466], [7394, 29416]]},
	{c: [[20907, 7645], [20902, 7845]]}, // bitterfrost
	{c: [[21408, 7470], [20907, 7645]]},
	{c: [[21749, 7519], [21896, 7322]]},
	{c: [[21896, 7322], [22298, 7966]]},
	{c: [[22303, 8024], [22753, 7609]]},
	{c: [[22308, 7376], [22244, 7556]]},
	{c: [[22406, 7857], [22335, 7653]]},
	{c: [[22456, 7439], [21749, 7519]]},
	{c: [[22753, 7609], [22944, 7235]]},
	{c: [[22944, 7235], [22456, 7439]]},
	{c: [[23089, 8148], [23538, 7673]]},
	{c: [[23146, 7517], [23492, 6934]]},
	{c: [[23380, 7561], [23025, 8129]]},
	{c: [[23632, 8070], [23575, 8061]]},
	{c: [[13794, 10161], [14125, 9839]], i: "http://i.imgur.com/05EZy40.png"}, // harathi
	{c: [[14628, 10642], [14684, 10351]], i: "http://i.imgur.com/pzi7QqB.png"}, // harathi
	{c: [[16123, 11449], [15715, 11526]], i: "http://i.imgur.com/LtlKlMd.png"}, // harathi
	{c: [[16719, 16097], [16790, 16379]], i: "http://i.imgur.com/4knjPzn.png"}, // bloodtide
	{c: [[17394, 16907], [17059, 17134]], i: "http://i.imgur.com/o9TKLre.png"}, // bloodtide
	{c: [[16395, 16847], [16271, 17151]], i: "http://i.imgur.com/mf84t3E.png"}, // bloodtide
	{c: [[16345, 20165], [15920, 20071]], i: "http://i.imgur.com/Ofvznoc.png"}, // sparkfly
	{c: [[16984, 21336], [17092, 21633]], i: "http://i.imgur.com/CKADrul.png"}, // sparkfly
	{c: [[15758, 20762], [16036, 21031]], i: "http://i.imgur.com/89HbHei.png"}, // sparkfly
	{c: [[20441, 23215], [20508, 23478]], i: "http://i.imgur.com/lsoFXtG.png"}, // maelstrom
	{c: [[21148, 22756], [21201, 22504]], i: "http://i.imgur.com/psc19cs.png"}, // maelstrom
	{c: [[29462, 18297], [29698, 18042]], i: "http://i.imgur.com/TBMgUBK.png"}, // fields
	{c: [[29637, 16740], [29530, 16996]], i: "http://i.imgur.com/wq10slX.png"}, // fields
	{c: [[31074, 16994], [30857, 17040]], i: "http://i.imgur.com/7VtKUTz.png"}, // fields
	{c: [[27655, 9992], [27820, 10306]], i: "http://i.imgur.com/bQcI0ZB.png"}, // marches
	{c: [[27688, 11471], [27813, 11056]], i: "http://i.imgur.com/G7KbiUs.png"}, // marches
	{c: [[28217, 11546], [28558, 11524]], i: "http://i.imgur.com/V02byvU.png"}, // marches
	{c: [[29771, 12832], [29751, 12716]], i: "http://i.imgur.com/XeC45o6.png"}, // blazeridge
	{c: [[29819, 12798], [29781, 12708]], i: "http://i.imgur.com/kYq3kVL.png"}, // blazeridge
	{c: [[29900, 12775], [29800, 12687]], i: "http://i.imgur.com/XvjUu86.png"}, // blazeridge
	{c: [[29646, 15191], [29645, 14997]], i: "http://i.imgur.com/vWiOGvt.png"}, // blazeridge
	{c: [[29839, 15255], [29689, 15497]], i: "http://i.imgur.com/pEE4dSa.png"}, // blazeridge
	{c: [[30527, 15382], [30258, 15615]], i: "http://i.imgur.com/OYwI6Tr.png"}, // blazeridge
	{c: [[25738, 10887], [25989, 10794]], i: "http://i.imgur.com/nLHpAY1.png"}, // fireheart
	{c: [[24256, 10327], [24486, 10547]], i: "http://i.imgur.com/Mw5RlZo.png"}, // fireheart
	{c: [[15224, 24113], [15138, 24433]], i: "http://i.imgur.com/Juve33P.png"}, // straits
	{c: [[13922, 24269], [13706, 24364]], i: "http://i.imgur.com/muYx0K5.png"}, // malchor
	{c: [[12708, 24331], [12352, 24504]], i: "http://i.imgur.com/20aN2Kl.png"}, // malchor
	{c: [[11912, 24958], [12203, 24781]], i: "http://i.imgur.com/v2nRrzR.png"}, // malchor
	{c: [[11248, 25762], [10899, 25948]], i: "http://i.imgur.com/Vkb74AG.png"}, // cursed
	{c: [[11122, 27381], [11248, 27635]], i: "http://i.imgur.com/20U6Gts.png"}, // cursed
	{c: [[11049, 27979], [11328, 27915]], i: "http://i.imgur.com/Yx0LBxP.png"} // cursed
	],
	// Jump crystals, Oakheart's Essence, and other powerups that gives mobility skills
	powerups: [
	{c: [2967, 25187]}, // draconis
	{c: [3134, 25213]},
	{c: [3172, 25498]},
	{c: [3250, 24948]},
	{c: [3255, 25656]},
	{c: [3282, 25205]},
	{c: [3321, 25282]},
	{c: [3353, 25602]},
	{c: [3371, 25444]},
	{c: [3375, 25897]},
	{c: [3410, 25535]},
	{c: [3428, 25727]},
	{c: [3491, 25116]},
	{c: [3611, 24821]},
	{c: [3618, 24592]},
	{c: [3626, 25508]},
	{c: [3670, 24807]},
	{c: [3703, 26058]},
	{c: [3716, 24919]},
	{c: [3754, 24722]},
	{c: [3786, 25277]},
	{c: [3802, 25696]},
	{c: [3805, 25886]},
	{c: [3867, 24868]},
	{c: [3940, 25896]},
	{c: [3941, 25717]},
	{c: [4130, 24453]},
	{c: [4282, 25554]},
	{c: [4369, 25284]},
	{c: [4375, 24715]},
	{c: [4537, 25504]},
	{c: [4545, 24889]},
	{c: [4601, 25065]},
	{c: [4681, 25726]}
	]
};



function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var getRandomColor = function () {
    return "#" + getRandomInt(50, 255).toString(16) + getRandomInt(50, 255).toString(16) + getRandomInt(50, 255).toString(16);
};

var checkPointInZone = function (zoneRect, point) {
    return (zoneRect[0][0] <= point[0]) && (point[0] <= zoneRect[1][0])
        && (zoneRect[0][1] <= point[1]) && (point[1] <= zoneRect[1][1]);
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
                        gameMap.customData.region = {};
                        gameMap.customData.region.id = region.id;
                        gameMap.customData.region.name = region.name;
            
                        // Add in portals
                        gameMap.customData.portals = [];
                        console.log(region.name + ": " + gameMap.continent_rect)
                        _.forEach(gateways.interborders, function(interborder) {
                            if (checkPointInZone(gameMap.continent_rect, interborder[0])) {
                                var portal = {};
                                portal.from = interborder[0];
                                portal.to = interborder[1];
                                portal.type = 'zoneborder';
                                gameMap.customData.portals.push(portal);
                            }
                            if (checkPointInZone(gameMap.continent_rect, interborder[1])) {
                                var portal = {};
                                portal.from = interborder[1];
                                portal.to = interborder[0];
                                portal.type = 'zoneborder';
                                gameMap.customData.portals.push(portal);
                            }
                        });
                        _.forEach(gateways.interzones, function(interzone) {
                            if (checkPointInZone(gameMap.continent_rect, interzone[0])) {
                                var portal = {};
                                portal.from = interzone[0];
                                portal.to = interzone[1];
                                portal.type = 'asuragate';
                                gameMap.customData.portals.push(portal);
                            }
                            if (checkPointInZone(gameMap.continent_rect, interzone[1])) {
                                var portal = {};
                                portal.from = interzone[1];
                                portal.to = interzone[0];
                                portal.type = 'asuragate';
                                gameMap.customData.portals.push(portal);
                            }
                        });
                        
                        
                        
                        
                        slimdata[gameMap.id] = gameMap;
                    }
                });
            });
            

            document.getElementById('builddata').textContent = JSON.stringify(slimdata, null, 0);
        });
};

(function () {
    "use strict";


    // Spit out world data
    getMergedFloorData();
})();
