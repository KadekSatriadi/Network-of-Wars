document.addEventListener("DOMContentLoaded", function(){
    var graphdata;
    var wardatapath = "./data/wardata.csv";
    var warlocationpath = "./data/warlocationlookup.csv";
    var convertNumbers = function(row) {
        var r = {};
        for (var k in row) {
            r[k] = +row[k];
            if (isNaN(r[k])) {
                r[k] = row[k];
            }
        }
        return r;
    }

    d3.csv(wardatapath,convertNumbers, function (data) {
        var wardata = data;
        d3.csv(warlocationpath,convertNumbers,function (data) {
            var warlocationdata = data;

            processData();
            var graphdata = getGraphData();
            WarForcedGraph.containerid = "canvas";
            WarForcedGraph.height = d3.select("body").style('height').slice(0, -2) ;
            WarForcedGraph.width = d3.select("body").style('width').slice(0, -2) - 500;
            WarForcedGraph.data = graphdata;
            WarForcedGraph.drawSvg();
            WarForcedGraph.drawGraphs();

            function getGraphDataId(nodes, name) {
                var id = -1;
                for(var i = 0; i < nodes.length; i++){
                    var node = nodes[i];
                    if(node.id === name){
                        id = i;
                        break;
                    }
                }
                return id;
            }
            function processData() {
                w = wardata;
                var wararray = [];
                for(var i = 0; i < w.length; i++){
                    var row = w[i];
                    var participant = {
                        warid: row.warid,
                        name: row.statename,
                        side: row.side,
                        death: row.death,
                        initiator: row.initiator,
                        location: getLocations(row.locationid),
                        coordinate: [
                            row.long, row.lat
                        ]
                    }
                    delete row.statename;
                    delete row.lat;
                    delete row.long;
                    delete row.initiator;
                    delete row.side;
                    row.location = [];

                    if(wararray.length == 0){
                        row.participants = [];
                        row.location = participant.location;
                        wararray.push(row);
                    }else{
                        wararray =  addWar(wararray,row);
                    }
                    wararray = addParticipant(wararray,participant);
                }

                completedata = wararray;
            }
            function getGraphData() {
                var graphdata;
                var nodes = [];
                var links = [];

                for(var i = 0; i < completedata.length; i++){
                    var war = completedata[i];
                    var warnode = {
                        id : war.name,
                        type: "war",
                        startyear: war.startyear,
                        endyear : war.endyear,
                        death: war.death
                    }
                    nodes.push(warnode);
                    var warid = nodes.length - 1;

                    var duration = war.endyear - war.startyear;
                    for(var j = 0; j < war.participants.length; j++){
                        var state =  war.participants[j];
                        var statenode = {
                            id : state.name,
                            type: "state",
                            death: state.death
                        }
                        var id = getGraphDataId(nodes,state.name);
                        if(id === -1){
                            nodes.push(statenode);
                            id = nodes.length - 1;
                        }
                        nodes = updateTotalDeathNode(nodes,state);
                        links.push({
                            source: id, target: warid, value: duration
                        })
                    }
                }
                graphdata = {
                    nodes : nodes,
                    links : links
                };
                return graphdata;
            }
            function getLocations(id) {
                var locations = [];
                for(var i =0; i < warlocationdata.length; i++){
                    var warloc = warlocationdata[i];
                    if(warloc.id === id){
                        locations.push(warloc);
                    }
                }
                return locations;
            }
            function addLocation(base,item) {
                for(var i=0; i < item.length; i++){
                    var loc = item[i];
                    var found = false;
                    for(var j = 0; j < base.length; j++){
                        if(base[j].code == loc.code){
                            found = true;
                            break;
                        }
                    }
                    if(!found) base.push(loc);
                }
                return base;
            }
            function addParticipant(wararray,participant) {
                for(var i = 0; i < wararray.length; i++) {
                    if(wararray[i].warid == participant.warid){
                        wararray[i].death = wararray[i].death + participant.death;
                        wararray[i].location = addLocation(wararray[i].location, participant.location);
                        wararray[i].participants.push(participant);
                    }
                }
                return wararray;
            }
            function updateTotalDeathNode(nodes, state) {
                var id = getGraphDataId(nodes, state.name);
                nodes[id].death += state.death;
                return nodes;
            }
            function addWar(wararray,row) {
                var found = false;
                for(var i = 0; i < wararray.length; i++) {
                    if(wararray[i].warid == row.warid){
                        found = true;
                        break;
                    }
                }
                if(!found){
                    row.participants = [];
                    row.death = 0;
                    wararray.push(row);
                }
                return wararray;
            }
            //end
        })
    })
}); 
