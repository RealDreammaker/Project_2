// requirement:
// input data: an array of country names and selected year
var selectedCountries = ["Australia","Germany","Japan", "Russia","China","Canada", "Brazil", "Mexico"];
var selectedYear = "2019";

var lightColors = ["lime","cyan","green","purple","yellow","orange","magenta","red","blue","pink"];

// const selectedDataSet = "../static/data/mobile-phone-subscriptions-vs-gdp-per-capita.csv"
const YLabel = "Mobile cellular subscriptions (per 100 people)";
const XLabel =  "GDP per capita, PPP (constant 2017 international $)"

const selectedDataSet = "/api/mobile"
const chosenYLabel = "subscriptions";
const chosenXLabel =  "gdp"

// delare default attributes 
const marginForLabel = 15;
const animateDudation = 1000;
const circleOpacity = 0.5; 



// create a responsive chart to window size
function makeResponsive(selectedCountries,selectedYear) {
    
    // ******************************************************
    // **************** SETTING UP SVG AREA  ****************
    // ******************************************************

    // clear existing svg area if there was one
    var svgArea = d3.selectAll("svg");
    if (!svgArea.empty()){
        svgArea.remove()
    };

    // set up responsive chart size, width is set to ensure no overlapping datapoint
    var svgWidth = document.getElementById('scatter').offsetWidth 
    // var svgWidth = 500
    var svgHeight = svgWidth * .7;

    // set margins for chart area
    var margin = {
        top: 5,
        bottom: 35 + marginForLabel * 2,
        left: 35 + marginForLabel,
        right: 5
    };

    // configure chart size
    var chartHeight = svgHeight - margin.top - margin.bottom;
    var chartWidth = svgWidth - margin.left - margin.right;

    // append svg to page
    var svg = d3.select("#scatter")
                .append("svg")
                .attr("height", svgHeight)
                .attr("width", svgWidth);

    // append chartgroup to svg area
    var chartGroup = svg.append("g")
        .attr("transform",`translate(${margin.left},${margin.top})`);


    // ******************************************************
    // *************** SETTING UP FUNCTIONS *****************
    // ******************************************************
    
    // function for setting up scales for X axis
    function xScaleF(data, chosenXAxis){
        
        var xLinearScale = d3.scaleLinear()
        .domain([
            d3.min(data, d => d[chosenXAxis]) * 0.8,
            d3.max(data, d => d[chosenXAxis]) * 1.23 
        ])
        .range([0,chartWidth]);
        
        return xLinearScale;
    };
    
    // function for setting up scales for Y axis
    function yScaleF(data, chosenYAxis){

        var yLinearScale = d3.scaleLinear()
        .domain([
            d3.min(data, d => d[chosenYAxis]) * 0.8,
            d3.max(data, d => d[chosenYAxis]) *1.23
        ])
        .range([chartHeight,0]);
        
        return yLinearScale;
    };  
    
    // functions for creating X axis
    function xAxisF(xAxisPassIn, newXAxisScale){

        var xAxis = d3.axisBottom(newXAxisScale)
            .tickSizeOuter(15)
            .tickSizeInner(6)
            .ticks(7);

        xAxisPassIn
            .attr("transform",`translate(0,${chartHeight})`)
            .transition()
            .duration(animateDudation)
            .call(xAxis);

        return xAxisPassIn;
    };
    
    // functions for creating Y axis
    function yAxisF(xAxisPassIn, newYAxisScale){

        var yAxis = d3.axisLeft(newYAxisScale)
            
        xAxisPassIn
            .transition()
            .duration(animateDudation)
            .call(yAxis)

        return xAxisPassIn;
    };

    // functions for creating grid
    function yGridF(gridPassIn, newYAxisScale){

        var grid = d3.axisLeft(newYAxisScale)
            .tickSize(chartWidth);
        
        gridPassIn
            .attr("stroke", "white")
            .attr("transform",`translate(${chartWidth},0)`)
            .style("opacity",0.2)
            .transition()
            .duration(animateDudation)
            .call(grid)

        return gridPassIn;
    };

    // functions for updating circles
    function circlesGroupF(circlesGroup,newXAxisScale, newYAxisScale, chosenXLabel,chosenYLabel){
            
        circlesGroup
            .transition()
            .duration(animateDudation)
            .attr("cx", d => newXAxisScale(d[chosenXLabel]))
            .attr("cy", d => newYAxisScale(d[chosenYLabel]))
        return circlesGroup;
    };

    // functions for updating annotations
    function annotateUpdate(textgroup,newXAxisScale, newYAxisScale, chosenXLabel,chosenYLabel){
            
        textgroup
            .transition()
            .duration(animateDudation)
            .attr("x", d => newXAxisScale(d[chosenXLabel]))
            .attr("y", d => newYAxisScale(d[chosenYLabel]))

    return textgroup;
    };

    // functions for creating AXIS LABELS
    function createLabel(labelgroup, id, labelText, statusClass, transform = "no"){
        // position and orientation of label depend on passing-in variables
        if (transform != "no"){
            var labelItem = labelgroup
                .attr("class","label")
                .append("text")
                    .attr("class", statusClass + " aText")
                    .attr("id", id)
                    .attr("transform", "rotate(-90)")
                    .attr("x", -chartHeight/2)
                    .attr("y", -margin.left + marginForLabel  )
                    .style("text-anchor","middle")
                    .text(labelText)
        }
        else {
            var labelItem = labelgroup
                .attr("class","label")
                .append("text")
                    .attr("class", statusClass + " aText")
                    .attr("id", id)
                    .attr("x", chartWidth/2 )
                    .attr("y", chartHeight + 15 + marginForLabel )
                    .style("text-anchor","middle")
                    .text(labelText)
        };

        return labelItem;
    };
    
    // functions for updating TOOLTIPS
    function updatingTooltips(circlesGroup, temCircle, textGroup, chosenXLabel,chosenYLabel){

        // create/replace tooltips
        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([60, -70])
            .html(function(d) {return`<b>${d.entity}</b><br>
                GDP: $${Math.round(d[chosenXLabel],2)} <br> 
                Subscription: ${Math.round(d[chosenYLabel],2)}<br>`}
            );
        
        chartGroup.call(toolTip);
        
        // create event listener when user have mouse on data the point
        circlesGroup.on("mouseover", function(d) {
            toolTip.show(d, this);
            
            d3.select(this)
                .attr("opacity", 1);

            // show a temporary circle that highlights the data point
            temCircle
                .attr("cx",d3.select(this).attr("cx"))
                .attr("cy",d3.select(this).attr("cy"))
                .attr("r",d3.select(this).attr("r"))
                .attr("stroke","blue")
                .attr("stroke-width",2)
        })
            
        circlesGroup.on("mouseout", function(d) {
            toolTip.hide(d);

            d3.select(this)
                .attr("opacity", circleOpacity);
            // hide temporary circle
            temCircle
            .attr("stroke","none")
        })

        textGroup.on("mouseover", function(d) {
            toolTip.show(d, this);
        
            // show temporary circle
            temCircle
            .attr("cx",d3.select(this).attr("x"))
            .attr("cy",d3.select(this).attr("y"))
            .attr("r",d3.select(this).attr("alt"))
            .attr("stroke","blue")
            .attr("stroke-width",2)
            .attr("opacity", 1)
            .style("z-index",-1)
        })


        textGroup.on("mouseout", function(d) {
            toolTip.hide(d);
            // hide temporary circle
            temCircle
            .attr("stroke","none")
            .attr("fill", "none")
            .style("z-index",-10)
        })
            

    return circlesGroup, textGroup;
    };

    // ******************************************************
    // ******* DATA EXTRACTION and CHARTS SKETCHING *********
    // ******************************************************
    // 
    // d3.csv(selectedDataSet).then(function(rawdata){
    d3.json(selectedDataSet).then(function(rawdata){

        console.log(rawdata)
        console.log("Year:" + selectedYear)
        console.log("Countries:" +selectedCountries)

        // filter data by removing null value in data column
        var filteredData = rawdata.filter(function(d){
            if (d[chosenYLabel] != "")  {
                return d;
            }
        });
        console.log(filteredData)
        
        // filter rawdata by year and selected countries
        data = filteredData.filter(function(d){
            if ((d.year == selectedYear) && (selectedCountries.includes(d.entity))) {
                return d;
            }
        });

        console.log(data)

        // parse data from string to integer
        data.forEach(function(d){
            d[chosenYLabel] = +d[chosenYLabel];
            d[chosenXLabel] = +d[chosenXLabel];
            d.year = +d.year; 
        });

        var xScale = xScaleF(data,chosenXLabel)
        var yScale = yScaleF(data,chosenYLabel)


        // append axis to group elements
        var grid = chartGroup.append("g")
        var yAxis = chartGroup.append("g")
        var xAxis = chartGroup.append("g")


        // initialize axis
        xAxisF(xAxis, xScale);
        yAxisF(yAxis, yScale);
        yGridF(grid, yScale);
        

        // initialize circles as scatter point
        var circlesGroup = chartGroup.append("g")
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
                .attr("class", "circles")
                .attr("r", d => parseInt(d[chosenYLabel]/5))
                .attr("opacity", circleOpacity)
                // choose color based on index of seleted country
                .attr("fill",d => lightColors[selectedCountries.indexOf(d.entity)] )

        // update circles 
        circlesGroup = circlesGroupF(circlesGroup,xScale,yScale,chosenXLabel,chosenYLabel);

        // initialize annotation of abreviated state name to each circle
        var textGroup = chartGroup.append("g")
            .selectAll("text")
            .data(data)
            .enter()
            .append("text")
                .attr("class","abbrState aText")
                //adjusted so text-anchor can move vertically
                .attr("dy","0.3em")
                // stamp alt details for  referencing later on
                .attr("alt",d => parseInt(d[chosenYLabel]/5))
                .text(d => d.entity.substring(0,2).toUpperCase())
                .text(d => d.entity)

        // update annotation of abreviated state name to each circle
        textGroup = annotateUpdate(textGroup,xScale, yScale, chosenXLabel,chosenYLabel);

        // add temporary circle for tooltip, intially set it to invisible
        var temCircle = chartGroup.append("circle")
                                    .attr("stroke","none")
                                    .attr("fill", "none")
        
        // intialize tooltips
        updatingTooltips(circlesGroup, temCircle, textGroup, chosenXLabel,chosenYLabel)


        // add labels for all axis
        var labelGroup = chartGroup.append("g");

        createLabel(labelGroup, "mobile", YLabel  , "active", "transform")
        createLabel(labelGroup, "GDP", XLabel  , "active")

    updateMap(selectedCountries, selectedYear, filteredData , chosenYLabel)    
    updateLineChart(selectedCountries, filteredData ,chosenYLabel, lightColors)
        
    }).catch(function(error){
        return console.warn(error);
    });
};


d3.select(window).on("resize", makeResponsive(selectedCountries,selectedYear))
