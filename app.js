const api = "https://data.gov.sg/api/action/datastore_search?resource_id=83c21090-bd19-4b54-ab6b-d999c251edcf"
//List of colors
const color = [
    "#072648",
    "#17c2bc",
    "#6ac217"
]

//Fetch all data from api
const fetchData = async () => {
    const res = await fetch (api);
    const data = await res.json();
    //data from api
    console.log(data); 
    return data;
}

// Creation of bar chart
const barChart2020 = async(option) =>{
    fetchData().then(data => { 
        //All 100 records of data from api
        const dataRecords = data.result.records;
        var data2020 = dataRecords.filter((record) => record.year == 2020);
        //Create 2018 - 2020 crime dataset
        if (option == 2){
            data2020 = dataRecords.filter((record) => record.year >= 2018);
        }
        
        //Select the svg element by id
        const chartBox = d3.select("#chart");

        //Ensure the svg is clear before drawing chart
        if (chartBox.firstChild)
            chartBox.removeChild(chartBox.firstChild);

        //set margin 20 extra pixels for axis on bottom and left
        var margin = {top: 10, right: 10, bottom: 60, left: 60},
        width = 1200 - margin.left - margin.right,
        height = 700 - margin.top -margin.bottom;

        //Getting max value for 2020 crime data for y scale
        var maxValue = Math.max.apply(Math, data2020.map(function(element) { return element.value; }));
        maxValue = Math.ceil(maxValue / 10) * 10;  
        
        //Scaling for bars x-axis
        const xScale = d3.scaleBand() 
                        .domain(data2020.map((datapoint) => datapoint.level_2))
                        .rangeRound([margin.left, width])
                        .padding(0.1);

        //Scaling for bars y-axis 
        const yScale = d3.scaleLinear()
                        .domain([0, maxValue+200])
                        .range([height, margin.top]);

        // Add x-axis line to graph
        chartBox.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale));

        // Add y-axis line to graph
        chartBox.append("g")
            .attr("transform", "translate(" + margin.left + ", 0)")
            .call(d3.axisLeft(yScale));
        
        //Add axis labels to the graph
        //X-axis label
        chartBox
            .append("text")
            .attr("transform", "translate(" + (width / 2) + "," + (height + 40) + ")")
            .text("Crime Type")
            .attr("text-align", "middle");

        //Y-axis label
        chartBox
            .append("text")
            .attr("transform", "translate(" + (margin.left-40) + "," +(height / 2) + ") rotate(-90)")
            .text("Occurences")
            .attr("text-align", "middle");
        
        //Color picker for different year
        function colorpicker(year) {
            if(year == 2020) {
                return color[0];
            }
            else if (year == 2019) {
                return color[1];
            }
            else
            {
                return color[2];
            }
        }
        
        //Draw out the chart
        chartBox.selectAll("rect")
                .data(data2020)
                .join(
                    //enter() animation
                    enter => enter
                        .append("rect")
                        .attr("x", xdata => xScale(xdata.level_2))
                        .attr("y", ydata => yScale(ydata.value))
                        .attr("width", 0)
                        .attr("height", 0)
                        .attr("fill", (data => colorpicker(data.year)))
                        //.attr("class", "svgRect")
                        .call(enter => enter.transition()
                            .duration(1000)
                            .attr("width", xScale.bandwidth())
                            .attr("height", (ydata) => height - yScale(ydata.value))
                        ),
                    //update animation
                    update => update    
                        .call(update => update.transition()
                            .duration(1000)
                            .attr("x", xdata => xScale(xdata.level_2))
                            .attr("y", ydata => yScale(ydata.value))
                            .attr("width", xScale.bandwidth())
                            .attr("height", (ydata) => height - yScale(ydata.value))
                        ),
                    //exit animation
                    exit => exit
                        .call(exit => exit.transition()
                            .duration(1000)
                            .attr("width", 0)
                            .attr("height", 0)
                            .remove()
                        )    
                )
                //mouseover tooltip effect
                .on("mouseover", (event) => {
                    d3.select(event.currentTarget)
                    .attr("stroke", "black")
                    .attr("stroke-width", 5)
                    .attr('opacity', '.85')
                    //show text on mouse over
                    .append('title')
                    .text((d) => d.value + ' ' + d.level_2 + ' cases in '+ d.year);
                }) 
                .on("mouseout", (event) => {
                    d3.select(event.currentTarget)
                    .attr("stroke", "none")
                    .attr('opacity', '1')
                    //remove text on mouse out
                    .select('title').remove()
                });
    })
}

d3.select("#button2020").on("click", function() {
    barChart2020(1)
});
d3.select("#buttonXxtra").on("click", function() {
    barChart2020(2)
});
barChart2020(1);
