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
                d3.json("stateMoviesCount.json", function(error, data) {
                    var moviesList = data[d.properties.STUSPS];
                    var top5Movies = Object.keys(moviesList).map(function(key) {
                        return { key: key, value: this[key] };
                    }, moviesList);
                    top5Movies.sort(function(p1, p2) { return p2.value - p1.value; });
                    top5Movies = top5Movies.slice(0, 8)
                    
                    var x = d3.scale.linear()
                        .range([0, 180])
                        .domain([0, d3.max(top5Movies, function (dt) {
                            return dt.value;
                        })]);

                    var y = d3.scale.ordinal()
                        .rangeRoundBands([180, 0], .1)
                        .domain(top5Movies.map(function (dt) {
                            return dt.key;
                        }).reverse());

                    details.selectAll(".bar").remove();
                    details.selectAll(".bar").transition().duration(1000).style("opacity", 1)
                    details.selectAll(".label").remove();
                    details.selectAll(".label").transition().duration(1000).style("opacity", 1)
                    var bars = details.selectAll(".bar")
                                        .data(top5Movies)
                                        .enter()
                                        .append("g")

                    var topMovies = bars.append("rect")
                                        .attr("class", "bar")
                                        .attr("y", function(dt) {
                                            return y(dt.key) + 100;
                                        })
                                        .attr("height", 15)
                                        .attr("x", 10)
                                        .attr("width", function(dt) {
                                            return x(dt.value)
                                        });

                    bars.append("text")
                        .attr("class", "label")
                        .attr("y", function(dt) {
                            return y(dt.key) + 110
                        }).attr("x", function (dt) {
                            return x(dt.value) + 20
                        }).text(function (dt) {
                            let lastIndex = dt.key.lastIndexOf(" ")
                            return dt.key.substring(0, lastIndex) + " (" + dt.value + ")"
                        });

                    var xAxis = d3.svg.axis().scale(x).orient("top")
                    var gx = details.append("g")
                                .attr("class", "x axis")
                                .call(xAxis)
                })

                details.selectAll(".arc").remove();
                details.selectAll(".arc").transition().duration(1000).style("opacity", 1);
                details.selectAll(".state-text").remove();
                details.append("text")
                        .attr("class", "state-text")
                        .attr("x", 10)
                        .attr("y", 75)
                        .text(d.properties.NAME)

                var g = details.selectAll(".arc")
                            .data(pie(state_gender_count[d.properties.STUSPS]))
                            .enter().append("g")
                            .attr("class", "arc")
                            .attr("transform", "translate(" + 100 + "," + 370 + ")");

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
                    .attr("text-anchor", "middle")
                    .text(function(a, i) {
                        return state_gender_count[d.properties.STUSPS][i].g
                    })

                details.append("rect")
                    .attr("class", "state-text")
                    .attr('width', 35)
                    .attr('height', 16)
                    .attr('x', 200)
                    .attr('y', 435)
                    .attr('fill', '#aaf3ff')

                details.append("text")
                    .attr("class", "gender-text")
                    .attr('x', 250)
                    .attr('y', 450)
                    .text('M')

                details.append("rect")
                    .attr("class", "state-text")
                    .attr('width', 35)
                    .attr('height', 16)
                    .attr('x', 200)
                    .attr('y', 455)
                    .attr('fill', '#ffaab6')
            
                details.append("text")
                    .attr("class", "gender-text")
                    .attr('x', 250)
                    .attr('y', 470)
                    .text('F')
            })
            .on("mouseout", function(d) {
                details.selectAll(".arc").transition().duration(500).style("opacity", 0);
                details.selectAll(".state-text").transition().duration(500).style("opacity", 0);
                details.selectAll(".gender-text").transition().duration(500).style("opacity", 0);
                details.selectAll(".label").transition().duration(500).style("opacity", 0);
                details.selectAll(".bar").transition().duration(500).style("opacity", 0);
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
