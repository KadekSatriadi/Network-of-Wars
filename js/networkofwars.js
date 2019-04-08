/**
 * Created by y32 on 03-Jun-17.
 */

var links = [];
var nodes = [];
var dumm = [];
for(var i = 0; i < 50; i++){
    links.push({
    source: i, target: i+1, value: 1
    })
    nodes.push({
        id: "war"+i, group: 1
    },{
        id:"state"+i, group:2
    })
}
dumm = {
    links: links, nodes : nodes
}

var WarForcedGraph = new function () {
    this.containerid;
    this.svg;
    this.height;
    this.width;
    this.links;
    this.nodes;
    var isfade=false;
    this.data = dumm;
    var self = this;

    this.drawSvg = function () {
        this.svg = d3.select("#"+this.containerid).append("svg");
        this.svg.attr("height", this.height)
            .attr("width", this.width);
    }

    this.drawGraphs = function () {
        var color = d3.scale.category20();
        var r = d3.scale.log();
        var force = d3.layout.force()
            .charge(-50)
            .linkDistance(50)
            .size([this.width-100, this.height-100]);

        this.links = this.svg.selectAll("line")
            .data(this.data.links)
            .enter().append("line")
            .attr("stroke","white")
            .style("stroke-width", function (d) {
                return r(d.value * 10);
            });


        var tip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        var statedim = 5;

        var getdimension = function (d) {
            if(d.type=="war")
                return r(d.death*100)*2;
            else
                return statedim;
        }

        function getEdgeRadius(d) {
            if(d.type === "war")
                return r(d.death*100)*2;
            else
                return 0;
        }
        this.nodes = this.svg.selectAll("rect")
            .data(this.data.nodes)
            .enter().append("rect")
            .attr("width", function (d) {
                return getdimension(d);
            })
            .attr("height", function (d) {
                return getdimension(d);
            })
            .style("fill", function (d) {
                if(d.type === "war")
                    return "red"
                else
                    return "white"
            })
            .attr("rx", function (d) {
                return getEdgeRadius(d);
            })
            .attr("ry", function (d) {
                return getEdgeRadius(d);
            })
            .on("mouseover", function (d) {
                showTip(d);
            })
            .on("mouseout", function (d) {
                hideTipe();
            })
            .on("click", function (d) {
                clickhandle(d);
            })
            .call(force.drag)

        force
            .nodes(this.data.nodes)
            .links(this.data.links)
            .on("tick", tick)
            .start();

        function zoomed() {
            g.attr("transform", d3.event.transform);
            };
            
        function getNode(id) {
            var node;
            self.nodes.each(function (d) {
                if(d.id === id){
                    node = this;
                }
            })
            return node;
        }

        function getNeighbours(id) {
            var nodes = [];
            var links = [];
            self.links.each(function (d) {
                if(d.source.id === id){
                    nodes.push(d.target);
                    links.push(d)
                }
                if(d.target.id === id){
                    nodes.push(d.source);
                    links.push(d)
                }
            })
            var data = {
                nodes: nodes, links : links
            };
            return data;
        }

        function clickhandle(data){
            if(isfade){
                unfadeAll();
                isfade = false;
            }else{
                highlightNeighbours(data);
                isfade= true;
            }
        }

        function unfadeAll() {
            self.links.each(function () {
                unfadeObject(this);
            })
            self.nodes.each(function () {
                unfadeObject(this);
            });
        }

        function highlightNeighbours (data){
            var neigbours = getNeighbours(data.id);
            console.log(neigbours);
            var all = neigbours.nodes.concat(data);
            highlightNodes(all);
            highlightLinks(neigbours.links);

        }

        function highlightNodes(nodes) {
            self.nodes.each(function (d) {
                var found = false;
                for(var i = 0; i < nodes.length; i++){
                    if(nodes[i].id ===  d.id){
                        found = true; break;
                    }
                }
                if(!found){fadeObject(this)};
            });
        }

        function highlightLinks(nodes) {
            self.links.each(function (d) {
                var found = false;
                for(var i = 0; i < nodes.length; i++){
                    if(nodes[i] === d){
                        found = true; break;
                    }
                }
                if(!found){fadeObject(this)};
            });
        }

        function fadeObject(node) {
            d3.select(node).transition().duration(1000).style("opacity",0.1);
        }

        function unfadeObject(node) {
            d3.select(node).transition().duration(1000).style("opacity",1);
        }

        function fadeObjects(nodes) {
            for(var i = 0; i < nodes.length; i++){
                fadeObject(nodes[i]);
            }
        }

        function hideTipe() {
            tip.transition()
                .duration(200)
                .style("opacity", 0).style("display","none");
        }
        function showTip(d) {
            var content = "<b>"+d.id+"</b>";

            if(d.type === "war") {
                content += " war (" + d.startyear + " - " + d.endyear;
                content += "<br/>" + addCommas(d.death) + " people";
            }
            tip.transition()
                .duration(200).style("display","block")
                .style("opacity", 1);
            tip	.html(content)
                .style("left", (d3.event.pageX - 30)  + "px")
                .style("top", (d3.event.pageY - 80) + "px");
        }
        function tick(e) {
            var k = 1 * e.alpha;

            self.links
                .each(function (d) {
                    d.source.y -= k, d.target.y += k;
                })
                .attr("x1", function (d) {
                    return d.source.x ;
                })
                .attr("y1", function (d) {
                    return d.source.y ;
                })
                .attr("x2", function (d) {
                    return d.target.x ;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                });

            self.nodes
                .attr("x", function (d) {
                    return d.x - d3.select(this).attr("width")/2;
                })
                .attr("y", function (d) {
                    return d.y - d3.select(this).attr("height")/2;
                });

        }
    }
    //source: http://www.mredkj.com/javascript/numberFormat.html
    function addCommas(nStr)
    {
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }
}