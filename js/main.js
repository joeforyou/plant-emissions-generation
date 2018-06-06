var selectedLevel, selectedCategory, selectedParameter;
$("#reset").hide();
$("#levelSelect").hide();
$("#categorySelect").hide();
$("#parameterSelect").hide();
d3.json("data/menu.json", function(error, data){
    if(error) { console.log(error); };

    levelsHTML = [];
    for (var i = 0; i < data.children.length; i += 1){
        levelsHTML.push("<button class='dataLevel btn btn-primary' id='" + camelize(data.children[i].name) + "'>" + data.children[i].name + "</button>");
    }
    $("#levelSelect").show();
    $("#levelSelect").html(levelsHTML.join(""));
    $(".dataLevel").on("click", function(e){
        $("#levelSelect").hide();
        for (var i = 0; i < data.children.length; i += 1){
            if(e.target.id == camelize(data.children[i].name)) {
                selectedLevel = data.children[i];
                $("#breadcrumbs").html("<p><a href='#' id='level'>" + selectedLevel.name + "</a></p>");
                categoriesHTML = [];
                for (var j = 0; j < data.children[i].children.length; j += 1){
                    categoriesHTML.push("<button class='categoryLevel btn btn-primary' id='" + camelize(data.children[i].children[j].name) + "'>" + data.children[i].children[j].name + "</button>");
                }
                $("#categorySelect").html(categoriesHTML.join(""));
                $("#categorySelect").show();
            }
        }
        $(".categoryLevel").on("click", function(e){
            $("#categorySelect").hide();
            for(var i = 0; i < selectedLevel.children.length; i += 1) {
                if(e.target.id == camelize(selectedLevel.children[i].name)){
                    selectedCategory = selectedLevel.children[i];
                    $("#breadcrumbs").html("<p><a href='#' id='level'>" + selectedLevel.name + "</a> > <a href='#' id='category'>" + selectedCategory.name + "</a></p>")
                    if(selectedLevel.name == "Gross Grid Loss") {
                        selectedParameter = selectedCategory;
                        $("#breadcrumbs").html("<p><a href='#' id='level'>" + selectedLevel.name + "</a>" + " > " + "<a href='#' id='category'>" + selectedCategory.name + "</a></p>")
                        clearViz()
                        createViz(selectedLevel, selectedCategory, selectedParameter)

                    } else {
                        parametersHTML = [];
                        for (var j = 0; j < selectedLevel.children[i].children.length; j += 1){
                            parametersHTML.push("<button class='parameterLevel btn btn-primary' id='" + selectedLevel.children[i].children[j].code + "'>" + selectedLevel.children[i].children[j].name + "</button>");
                            $("#parameterSelect").html(parametersHTML.join(""));
                            $("#parameterSelect").show();
                        }
                    }
                    $("#level").on("click", function(){
                        $("#breadcrumbs").html("<p><a href='#'>eGRID</a></p>")
                        $("#vizTitle").hide();
                        $("#parameterSelect").hide();
                        $("#changeParameter").hide();
                        clearViz()
                        $("#levelSelect").show();
                    })

                    $("#category").on("click", function(){
                        $("#breadcrumbs").html("<p> <a href='#' id='level'>" + selectedLevel.name + "</a>" + "</p>")
                        $("#vizTitle").hide();
                        $("#parameterSelect").hide();
                        $("#changeParameter").hide();
                        clearViz()
                        $("#categorySelect").show();

                        $("#level").on("click", function(){
                            $("#breadcrumbs").html("<p><a href='#'>eGRID</a></p>")
                            $("#categorySelect").hide();
                            $("#vizTitle").hide();
                            $("#parameterSelect").hide();
                            $("#changeParameter").hide();
                            clearViz()
                            $("#levelSelect").show();
                        })
                    })
                }
            }
            
            $(".parameterLevel").on("click", function(e){
                $("#parameterSelect").hide();
                for (var i = 0; i < selectedCategory.children.length; i +=1 ){
                    if(e.target.id == selectedCategory.children[i].code){
                        selectedParameter = selectedCategory.children[i]
                        var paramSelectHTML = [];
                        
                        $("#breadcrumbs").html("<p><a href='#' id='level'>" + selectedLevel.name + "</a>" + " > " + "<a href='#' id='category'>" + selectedCategory.name + "</a></p>")
                        clearViz();
                        createViz(selectedLevel, selectedCategory, selectedParameter);
                        
                        $("#level").on("click", function(){
                            $("#breadcrumbs").html("<p><a href='#'>eGRID</a></p>")
                            $("#vizTitle").hide();
                            $("#changeParameter").hide();
                            clearViz()
                            $("#levelSelect").show();
                        })

                        $("#category").on("click", function(){
                            $("#breadcrumbs").html("<p><a href='#' id='level'>" + selectedLevel.name + "</a>" + "</p>")
                            $("#vizTitle").hide();
                            $("#changeParameter").hide();
                            clearViz()
                            $("#categorySelect").show();

                            $("#level").on("click", function(){
                                $("#breadcrumbs").html("<p><a href='#'>eGRID</a></p>")
                                $("#categorySelect").hide();
                                $("#vizTitle").hide();
                                $("#parameterSelect").hide();
                                $("#changeParameter").hide();
                                clearViz()
                                $("#levelSelect").show();
                            })
                        })

                    }
                }
            });
        });

        $("#level").on("click", function(){
            $("#breadcrumbs").html("<p><a href='#'>eGRID</a></p>")
            $("#vizTitle").hide();
            $("#categorySelect").hide();
            $("#changeParameter").hide();
            clearViz()
            $("#levelSelect").show();

        })

    });

hideStuff();

});

function hideStuff() {
    $("#plant").trigger("click")
    $(".categoryLevel").each(function(e){
        if($(this)[0].id != "emissions" && $(this)[0].id != "generation") {
            $(this).hide();
        }
    });
    $("#breadcrumbs").hide();
}

var selection;
var units;

function clearViz(){
    $("#reset").hide();
    $("#main h1").html("");
    $("#viz").html("");
    $("#kpi").html("");
    $("#chart").html("");
}

function reset(){
    window.location.reload();
}

function createViz(level, category, param) {
        $("#reset").show();
        //$("#breadcrumbs").show();
        $("#vizTitle").show();
        $("#changeParameter").show();
        // Get user selections
        // selection = d;
        units = findUnits(param.name);
        // Load CSV
        d3.csv("data/egrid2016_"+camelize(level.name.toLowerCase())+".csv", function(d){
            if(["Subregion","NERC","State","US","Gross Grid Loss"].includes(level.name)){
                return {
                    // one level, one parameter: state, subregion, nerc, us, ggl
                    level: d[level.code],
                    measure: strToInt(d[param.code])
                };
            } else if (level.name == "Plant") {
                return {
                    // Plant 
                    level: d[level.code], // Plant name
                    measure: strToInt(d[param.code]), // measure
                    state: d["PSTATABB"],
                    oris: d["ORISPL"],
                    oprname: d["OPRNAME"],
                    utility: d["UTLSTRVNM"],
                    balauth: d["BANAME"],
                    nerc: d["NERC"],
                    subregion: d["SUBRGN"],
                    county: d["CNTYNAME"],
                    lat: d["LAT"],
                    lon: d["LON"],
                    fuel: d["PLPRMFL"],
                    ffuel: d["PLFUELCT"],
                    cap: d["CAPFACT"]
                };
            } else if (level.name == "Generator") {
                return {
                    // Generator
                    level: d[level.code],
                    measure: strToInt(d[param.code]),
                    genID: d["GENID"],
                    state: d["PSTATABB"],
                    oris: d["ORISPL"]
                }
            }
        },function(data) {
            var max = d3.max( data, function(d) { return d.measure; });
            var min = d3.min( data, function(d) { return d.measure; });
            document.getElementById("vizTitle").innerHTML = "<h2>" + param.name +"</h2>";
            document.getElementById("changeParameter").innerHTML = "<select id='paramSelect' class='form-control'><option>(change parameter)</option></select>";
            if(selectedLevel.name == "Gross Grid Loss") {
                for(var i = 0; i < level.children.length; i += 1) {
                    $("#paramSelect").append("<option>" + level.children[i].name +"</option>")
                }
            } else {
                for(var i = 0; i < category.children.length; i += 1) {
                    $("#paramSelect").append("<option>" + category.children[i].name +"</option>")
                }
            }
            if(["Subregion","NERC","State","US","Gross Grid Loss"].includes(level.name)){
                displayMap(data, max); // Area map for Subregion, NERC, and State data levels
                displayKPI(data, max);
                if(selectedLevel.name != "US"){
                    displayBarGraph(data, max);
                } else {
                    // Display a bar graph comparing other parameters in same category
                }
            } else if (level.name == "Plant") {
                displayDotMap(data, level, param, min, max)
                displayKPI(data, max)
                displayPlantBarGraph(data, max)
            } else if (level.name == "Generator") {
                displayDotMap(data, level, param, min, max)
            }

            $("#paramSelect").on("change", function(e){
                if(e.currentTarget.value !== "(change parameter)"){
                    var newSelection = {name: e.currentTarget.value, parent: selectedParameter.parent}
                    if(selectedLevel.name == "Gross Grid Loss"){
                        for(var i = 0; i < level.children.length; i += 1){
                            if(level.children[i].name == e.currentTarget.value){
                                newSelection["code"] = level.children[i].code;
                            }
                        }
                        clearViz();
                        createViz(selectedLevel, selectedCategory, newSelection);
                    } else{
                        for(var i = 0; i < category.children.length; i += 1){
                            if(category.children[i].name == e.currentTarget.value){
                                newSelection["code"] = category.children[i].code;
                                //console.log(newSelection)
                            }
                        }
                        clearViz();
                        createViz(selectedLevel, selectedCategory, newSelection);
                    }
                }
            });
        });
}

// Helper function to make names camelCase
function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '');
}
// Helper function to convert numbers with commas to integers
function strToInt(str) {    
    if (str != "--" & str != "" & str != "n/a") {
        return parseFloat(str.replace(/,/g,''),10) 
    } else {
        return 0;
    }
}
// Helper function to find rounded max
function roundMax(num) {
    if(num !== "--"){
        if(num < 1){
            return Math.round(num*100)/100
        } else {
            var n = Math.round(num,2)
            var z = n.toString().length - 1
            var exp = Math.pow(10,z)
            return Math.ceil(n / exp) * exp 
        }
    } else {
        return 0;
    }
}
function findTickValues(num) {
    return d3.range(num / 10, num, num / 10);
}
function findTickFormat(max) {
    if(selectedCategory.name != "Resource Mix" & selectedCategory.name != "Emission Rate"){
        var str = "1e" + max.toString().length - 2; 
        return d3.format(".2s", parseInt(str));
    } else {
        return d3.format(".2", max)
    }
}
function findUnits(str) {
    return str.match(/\(([^)]+)\)/)[1];
}
function numberWithCommas (x) {
    if(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    } else {
        return 0;
    }
}
// Display Map
function displayMap(data, max) {

        //Width and height of map
        var width = 600;
        var height = 300;
        // D3 Projection
        var projection = d3.geo.albersUsa();
        
        projection
            .translate([width/2, height/2])    // translate to center of screen
            .scale([width]);          // scale things down so see entire US
        // Define path generator
        var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
                    .projection(projection);  // tell path generator to use albersUsa projection
        
        var color = d3.scale.linear()
        
        var roundedUp = roundMax(max);

        color.domain([0, roundedUp]).range(["#eeeeee","steelblue"]);

        //Create SVG element and append map to the SVG
        var svg = d3.select("#viz")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height);

        // Tooltip
        var tooltip = d3.select("#viz").append("div") 
            .attr("class", "tooltip")       
            .style("opacity", 0);
        // Load GeoJSON data and merge with states data
        d3.json("data/"+camelize(selectedLevel.name.toLowerCase())+".json",function(json) {
        // Loop through each state data value in the .csv file
        var _json = json;

        for (var i = 0; i < data.length; i++) {
            // Grab data level
            var dataLevel = data[i].level;
            // Grab data value 
            var dataValue = data[i].measure;
            // Find the corresponding state inside the GeoJSON
            for (var j = 0; j < _json.features.length; j++)  {
                var jsonLevel = _json.features[j].properties.name;
                if (dataLevel == jsonLevel) {
                // Copy the data value into the JSON
                _json.features[j].properties.units = units;
                _json.features[j].properties[selectedLevel.code] = dataValue;
                // Stop looking through the JSON
                break;
                }
            }
        }
        // Bind the data to the SVG and create one path per GeoJSON feature
        svg.selectAll("path")
            .data(_json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("class","map")
            .style("stroke", "#a9a9a9")
            .style("stroke-width", "1")
            .on("mouseover", function(d) {
                if(selectedLevel.name != "US"){
                    document.getElementById("kpi").firstChild.innerHTML = "<h1>" + numberWithCommas(d.properties[selectedLevel.code]) + "</h1><h4>" + units + " (current selection)</h4>"
                    tooltip.transition()    
                    .duration(200)    
                    .style("opacity", .9);    
                    tooltip.html(d.properties.name + "<br>" + numberWithCommas(d.properties[selectedLevel.code]) + " " + units)
                    .style("left", (d3.event.pageX) + "px")   
                    .style("top", (d3.event.pageY - 100) + "px"); 
                } else {
                    tooltip.transition()    
                    .duration(200)    
                    .style("opacity", .9);    
                    tooltip.html(d.properties.name)
                    .style("left", (d3.event.pageX) + "px")   
                    .style("top", (d3.event.pageY - 100) + "px"); 
                }
                })          
            .on("mouseout", function(d) {
                if(selectedLevel.name != "US"){
                document.getElementById("kpi").firstChild.innerHTML = "<h1>--</h1><h4>" + units + " (current selection)</h4>" 
                tooltip.transition()    
                .duration(500)    
                .style("opacity", 0); 
                } else {
                    tooltip.transition()    
                    .duration(500)    
                    .style("opacity", 0); 
                }
                })
            .style("fill", function(d) {
            // Get data value
            var value = d.properties[selectedLevel.code];
            if (value) {
            //If value exists…
                return color(value);
            } else {
            //If value is undefined…
            return "rgb(213,222,217)";
            }
        });
        if(selectedLevel.name != "US"){
            var svgGradient = d3.select("#viz")
                                .append("svg")
                                .attr("width","600px")
                                .attr("height","60px")
                                .attr("class","center");

            // append title
            // svgGradient.append("text")
            //     .attr("class", "legendTitle")
            //     .attr("x", 0)
            //     .attr("y", 60)
            //     .style("text-anchor", "left")
            //     .text(selection.name);

            var defs = svgGradient.append("defs");

            var linearGradient = defs.append("linearGradient")
                                        .attr("class","legend")
                                        .attr("id","linear-gradient")

            linearGradient
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "100%")
                .attr("y2", "0%");

            linearGradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "#eeeeee")
            //Set the color for the end (100%)
            linearGradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "steelblue");

            svgGradient.append("rect")
                .attr("width", 400)
                .attr("height", 20)
                .style("fill", "url(#linear-gradient)");

            // create tick marks
            var xLeg = d3.scale.linear()
                            .domain(color.domain())
                            .range([0,400]);

            var axisLeg = d3.svg.axis()
                .scale(xLeg)
                .orient("bottom")
                .tickSize(10)
                .tickValues(findTickValues(roundedUp))
                .tickFormat(findTickFormat(max));

            if(max == 0) {
                svgGradient.attr("display","none")
                }

            svgGradient
                .attr("class", "axis")
                .append("g")
                .attr("transform", "translate(0, 20)")
                .call(axisLeg)
            }
        
        });
        

    }


// Display KPI
function displayKPI(data, max) {
    if(selectedLevel.name != "US"){
        if(selectedCategory.name != "Resource Mix" & selectedCategory.name != "Emission Rate") {
            var kpi = document.getElementById("kpi");
            // Add selection div
            var sel = document.createElement("div")
            sel.innerHTML = "<h1>--</h1><h4>" + units + " (current selection)</h4>"
            kpi.appendChild(sel);
            // Add max div
            var maxKPI = document.createElement("div");
            maxKPI.innerHTML = "<h1>" + numberWithCommas(max) + "<h1><h4>max " + units + "</h4>";
            kpi.appendChild(maxKPI);
            // Add total div
            var sum = d3.sum(data, function(d){ return d.measure; });
            var sumKPI = document.createElement("div");
            sumKPI.innerHTML = "<h1>" + numberWithCommas(Math.round(sum,.1)) + "</h1><h4>total " + units + "</h4>";
            kpi.appendChild(sumKPI);
        } else {
            var kpi = document.getElementById("kpi");
            // Add selection div
            var sel = document.createElement("div")
            sel.innerHTML = "<h1>--</h1><h4>" + units + " (current selection)</h4>"
            kpi.appendChild(sel);
            // Add max div
            var maxKPI = document.createElement("div");
            maxKPI.innerHTML = "<h1>" + numberWithCommas(max) + "<h1><h4>max " + units + "</h4>";
            kpi.appendChild(maxKPI);
            // Add avg div
            var avg = d3.mean(data, function(d){ return d.measure; });
            var avgKPI = document.createElement("div");
            avgKPI.innerHTML = "<h1>" + Math.round(1000*avg)/1000 + "</h1><h4>average " + units + "</h4>";
            kpi.appendChild(avgKPI);
        }
    } else {
        var kpi = document.getElementById("kpi");
        // Add total div
        var sum = d3.sum(data, function(d){ return d.measure; });
        var sumKPI = document.createElement("div");
        sumKPI.innerHTML = "<h1>" + numberWithCommas(Math.round(sum,.1)) + "</h1><h4>total " + units + "</h4>";
        kpi.appendChild(sumKPI);
    }
}

// Display plant bar graph

function displayPlantBarGraph(data, max) {

    subset = getTopTwenty(data);
    max = d3.max(subset, function(d){ return d.measure; })
    min = d3.min(subset, function(d){ return d.measure; })

    var margin = {top: 20, right: 30, bottom: 30, left: 250},
        width = document.body.clientWidth - 100  - margin.left - margin.right,
        height = 350 - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .range([10,width])
        .domain([min,max])
    
    var y = d3.scale.ordinal()
        .rangeRoundBands([0,height], .1)
        .domain(subset.map(function(d){ return d.level; }))
            //make y axis to show bar names
    var yAxis = d3.svg.axis()
        .scale(y)
        //no tick marks
        .tickSize(0)
        .orient("left");

    // var x = d3.scale.ordinal()
    //     .rangeRoundBands([0, width], .1);

    // var y = d3.scale.linear()
    //     .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickFormat(findTickFormat(max))
        .tickSize(10)
        .orient("top");

    // var yAxis = d3.svg.axis()
    //     .scale(y)
    //     .tickFormat(findTickFormat(max))
    //     .orient("left");

    var tooltip = d3.select("#viz").append("div") 
        .attr("class", "barTooltip")       
        .style("opacity", 0);

    var chart = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    chart.append("g")
    .attr("class", "x barAxis")
    //.attr("transform", "translate(0," + width + ")")
    .call(xAxis);

    chart.append("g")
    .attr("class", "y axis")
    .call(yAxis);

    chart.selectAll(".bar")
    .data(subset)
    .enter().append("rect")
        .on("mouseover", function(d) {
            document.getElementById("kpi").firstChild.innerHTML = "<h1>" + numberWithCommas(d.measure) + "</h1><h4>" + units + " (current selection)</h4>"
            tooltip.transition()    
            .duration(200)    
            .style("opacity", .9);    
            tooltip.html(numberWithCommas(d.measure) + " " + units)  
            .style("left", (d3.event.pageX) + "px")   
            .style("top", (d3.event.pageY - 100) + "px")
        })
        .on("mouseout", function(d) {
            document.getElementById("kpi").firstChild.innerHTML = "<h1>--</h1><h4>" + units + " (current selection)</h4>" 
            tooltip.transition()    
            .duration(500)    
            .style("opacity", 0); 
        })
    .attr("class", "bar")
    .attr("x", "0")
    .attr("y", function(d) { if(d.level) { return y(d.level); } })
    .attr("width", function(d) { if(d.measure) { return x(d.measure); } })
    .attr("height", y.rangeBand());

    chart.append("text")
        .attr("x",0 - margin.left + 100)
        .attr("y", 0)
        .attr("text-anchor","middle")
        .attr("font-weight","bold")
        .text("Top twenty sources")

}

// Display Bar Graph
function displayBarGraph(data, max) {

    var margin = {top: 20, right: 30, bottom: 30, left: 40},
        width = document.body.clientWidth - 100  - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
    
    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .tickFormat(findTickFormat(max))
        .orient("left");
    
    var tooltip = d3.select("#viz").append("div") 
        .attr("class", "barTooltip")       
        .style("opacity", 0);

    var chart = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(data.map(function(d){ return d.level; }));
    y.domain([0, max]);

    chart.append("g")
      .attr("class", "x barAxis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    chart.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    chart.selectAll(".bar")
      .data(data)
    .enter().append("rect")
        .on("mouseover", function(d) {
            document.getElementById("kpi").firstChild.innerHTML = "<h1>" + numberWithCommas(d.measure) + "</h1><h4>" + units + " (current selection)</h4>"
            tooltip.transition()    
            .duration(200)    
            .style("opacity", .9);    
            tooltip.html(numberWithCommas(d.measure) + " " + units)  
            .style("left", (d3.event.pageX) + "px")   
            .style("top", (d3.event.pageY - 100) + "px")
        })
        .on("mouseout", function(d) {
            document.getElementById("kpi").firstChild.innerHTML = "<h1>--</h1><h4>" + units + " (current selection)</h4>" 
            tooltip.transition()    
            .duration(500)    
            .style("opacity", 0); 
        })
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.level); })
      .attr("y", function(d) { if(d.measure) { return y(d.measure); } })
      .attr("height", function(d) { if(d.measure) { return height - y(d.measure); } })
      .attr("width", x.rangeBand());

}

function displayDotMap(data, level, param, min, max){
    $("#viz").hide();
    $("#kpi").hide();

    var width = 900;
    var height = 500;

    var projection = d3.geo.albersUsa();

    projection
        .translate([width/2, height/2])    // translate to center of screen
        .scale([width]);
    
    var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
                .projection(projection);

    var svg = d3.select("#viz")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    var tooltip = d3.select("#viz").append("div") 
        .attr("class", "dotTooltip")       
        .style("opacity", 0);

    d3.json("data/state.json", function(outlineJSON){
        svg.selectAll("path")
            .data(outlineJSON.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", "#a9a9a9")
            .style("stroke-width", "1")
            .style("fill", "rgb(213,222,217)")
    });

    d3.json("data/plant.json", function(json){
        if(level.name == "Plant") {
            //var maxCircleRadius = d3.min([this.scales.y.bandwidth(), this.scales.x.step()]) / 2;
            //var maxCircleArea = Math.PI * Math.pow(20, 2)

            var rscale = d3.scale.linear()
                .domain([min,max])
                .range([0,25])
            
            svg.selectAll("circle")
                .data(json.features)
                .enter()
                .append("circle")
                .on("mouseover", function(d) {
                    document.getElementById("kpi").firstChild.innerHTML = "<h1>" + numberWithCommas(d.properties[param.code]) + "</h1><h4>" + units + " (current selection)</h4>"
                    tooltip.transition()    
                    .duration(200)    
                    .style("opacity", .9);    
                    tooltip.html(
                        "<strong>" + d.properties["PNAME"] + "</strong><br>" +
                        " (ORISPL: "+ d.properties["ORISPL"] + ")<br>"+
                        numberWithCommas(d.properties[param.code]) + " " + units + "<br>" +
                        "State: " + d.properties["PSTATABB"]
                    )  
                    .style("left", (d3.event.pageX) + "px")   
                    .style("top", (d3.event.pageY - 100) + "px")
                })
                .on("mouseout", function(d) {
                    document.getElementById("kpi").firstChild.innerHTML = "<h1>--</h1><h4>" + units + " (current selection)</h4>" 
                    tooltip.transition()    
                    .duration(500)    
                    .style("opacity", 0); 
                })
                .attr("cx", function(d){ 
                    if(projection(d.geometry.coordinates) ) { 
                        return projection(d.geometry.coordinates)[0] 
                    }
                })
                .attr("cy", function(d){ 
                    if(projection(d.geometry.coordinates)) { 
                        return projection(d.geometry.coordinates)[1]
                    }
                })
                .attr("r", function(d){
                    if(d.properties[param.code] == 0){
                        return 0;
                    } else {
                        return rscale(typeCheck(d.properties[param.code]))
                    }
                })
                .attr("fill","steelblue")
                .style("opacity","0.7")
                
                document.getElementById("kpi").style = "text-align: right; margin-top: 100px;"
                
                $("#viz").removeClass("col-md-6")
                $("#kpi").removeClass("col-md-6")
                $("#viz").addClass("col-md-9")
                $("#kpi").addClass("col-md-3")
                $("#viz").show();
                $("#kpi").show();
        } else if (level.name == "Generator"){
            var _json = json
            
            for (var i = 0; i < data.length; i += 1){
                //console.log(data[i].level)
                for (var j = 0; j < _json.features.length; j += 1) {
                    //console.log(_json.features[i].properties.PNAME)
                }
            }
            
        }

                    
    });

    
}

function typeCheck(val) {
    if(typeof val == "string"){
        return strToInt(val);
    } else if (val == "number"){
        return val;
    } else {
        return null;
    }
}

function getTopTwenty(arrayData){  //sorting to top 50 function
    arrayData.sort(function(a, b) {
                    return parseFloat(b.measure) - parseFloat(a.measure);
                    });
    return arrayData.slice(0, 20); 
}

$("#reset").on("click", function(){
    reset();
});