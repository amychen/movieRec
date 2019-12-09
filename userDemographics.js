var height = 550;
var map = d3.select("body")
            .append("svg")
            .attr("width", 880)
            .attr("height", height);

var details = d3.select("body")
                .append("svg")
                .attr("class", "details")
                .attr("width", 370)
                .attr("height", height);

var svgDefs = map.append("defs");

var gradient = svgDefs.append("linearGradient").attr('id', 'mainGradient');
gradient.append("stop").attr('class', 'stop-left').attr('offset', '0');
gradient.append("stop").attr('class', 'stop-right').attr('offset', '1');

var linear = d3.scale.linear().domain([0, 1100]).range([0, 1])
var computeColor = d3.interpolate("#ebaaff", "#7f00c9")
var genderColor = ["#aaf3ff", "#ffaab6"]

var path = d3.geo.path();
var pie = d3.layout.pie().value(function(d) { return d.g; })
var arc = d3.svg.arc().outerRadius(70).innerRadius(35);

var state_count = {};
var state_gender_count = {};
d3.csv("ml-1m/user_zip.csv", function(error, userData) {
    userData.forEach(function(d) {
        var city = d.MI;
        if (state_count[city] === undefined) {
            state_count[city] = 0;
            state_gender_count[city] = [];
            for (var i = 0; i < 2; i++) {
                state_gender_count[city].push({'g': 0});
            }
        } else {
            state_count[city] += 1;
            if (d.F === 'M') {
                state_gender_count[city][0].g += 1;
            } else {
                state_gender_count[city][1].g += 1;
            }
        }
    })

    d3.json("usa-topo.json", function(error, usa) {
        var geojson = topojson.feature(usa, usa.objects.tracts);
        map.selectAll("path")
            .data(geojson.features)
            .enter().append("path")
            .attr("class", function(d) {return "state " + d.properties.STUSPS})
            .attr("fill", function (d) {
                return computeColor(linear(state_count[d.properties.STUSPS]));
            })
            .attr("d", path)
            .on("mouseover", function(d) {
                details.selectAll(".arc").transition().duration(1000).style("opacity", 1);
                details.selectAll(".arc").remove();
                details.selectAll(".state-text").remove();
                details.append("text")
                        .attr("class", "state-text")
                        .attr("x", 15)
                        .attr("y", 15)
                        .text(d.properties.NAME)
                var g = details.selectAll(".arc")
                            .data(pie(state_gender_count[d.properties.STUSPS]))
                            .enter().append("g")
                            .attr("class", "arc")
                            .attr("transform", "translate(" + 225 + "," + 300 + ")");
                g.append("path")
                    .attr("d", arc)
                    .style("stroke-width", "3px")
                    .style("fill", function(d, i) {
                        return genderColor[i];
                    })

                g.append("text")
                    .attr("transform", function(d) { 
                        return "translate(" + arc.centroid(d) +")"; 
                    })
                    .attr("text-anchor", "middle").text(function(a, i) {
                        return state_gender_count[d.properties.STUSPS][i].g
                    })
            })
            .on("mouseout", function(d) {
                details.selectAll(".arc").transition().duration(500).style("opacity", 0);
                details.selectAll(".state-text").transition().duration(500).style("opacity", 0);
            })
            .append("title").text(d => `${d.properties.NAME}, ${state_count[d.properties.STUSPS]} users`)
    });
});

details.append('rect')
    .classed('filled', true)
    .attr('x', 140)
    .attr('y', height - 45)
    .attr('width', 180)
    .attr('height', 20); 

details.append('text')
    .attr("x", 2)
    .attr("y", height - 30)
    .text('Number of Users')
    
details.append('text')
    .attr("x", 140)
    .attr("y", height)
    .text("0")

details.append('text')
    .attr("x", 288)
    .attr("y", height)
    .text("1099")
