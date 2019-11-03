var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 60,
  right: 60,
  bottom: 120,
  left: 150
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var journalism = null;
var chosenXAxis = "poverty"; //Default x axis
var chosenYAxis = "obesity"; //Default y axis
var xAxisLabels = ["poverty", "age", "income"];
var yAxisLabels = ["obesity", "smokes", "healthcare"];
var labelsTitle = { "poverty": "In Poverty (%)",
                    "age": "Age (Median)",
                    "income": "Household Income (Median)",
                    "obesity": "Obese (%)",
                    "smokes": "Smokes (%)",
                    "healthcare": "Lacks Healthcare (%)" };
var axisPadding = 20;

// function used for updating x-scale var upon click on axis label
function scale(journalism, chosenXAxis) {
    // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(journalism, d => d[chosenXAxis]) * 0.8,
      d3.max(journalism, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating Axis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var botttomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(botttomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(elemEnter, newScale, chosenAxis) {

  elemEnter.selectAll("circle")
    .transition()
    .duration(1000)
    .attr(`c${xy}`, d => newScale(d[chosenAxis]));

  elemEnter.selectAll("text")
    .transition()
    .duration(1000)
    .attr(`d${xy}`, d => newScale(d[chosenAxis]));

  return elemEnter;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, elemEnter) {

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(d => `${d.state} <br>${chosenXAxis}: ${d[chosenXAxis]} <br>${chosenYAxis}: ${d[chosenYAxis]}`);
    
  svg.call(toolTip);

    // hovering event
    elemEnter.classed("active inactive", true)
    .on('mouseover', toolTip.show)
    .on("mouseout", toolTip.hide);
    
  return elemEnter;
}

// function initialize the chart elements
function init() {
  // variable radius for circle
  var r = 10;
  // Create initial xLinearScale, yLinearScale
  var xLinearScale = scale(journalism, chosenXAxis, "x");
  var yLinearScale = scale(journalism, chosenYAxis, "y");

  // Create initial axis
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
      .classed("axis", true)
      .attr("transform", `translate(0, ${height})`)
      .attr("id", "xAxis")
      .call(bottomAxis);

  // // append y axis
  var yAxis = chartGroup.append("g")
    .classed("axis", true)
    .attr("id", "yAxis")
    .call(leftAxis);
    
  // Define the data for the circles + text
  var elem = chartGroup.selectAll("g circle")
      .data(journalism);

  // Create and place the "blocks" containing the circle and the text  
  var elemEnter = elem.enter()
      .append("g")
      .attr("id", "elemEnter");
  
  // Create the circle for each block
  elemEnter.append("circle")
      .attr('cx', d => xLinearScale(d[chosenXAxis]))
      .attr('cy', d => yLinearScale(d[chosenYAxis]))
      .attr('r', r)
      .classed("stateCircle", true);
  
  // Create the text for each circle
  elemEnter.append("text")
      .attr("dx", d => xLinearScale(d[chosenXAxis]))
      .attr("dy", d => yLinearScale(d[chosenYAxis]))
      .classed("stateText", true)
      .attr("font-size", parseInt(r*0.8))
      .text(d => d.abbr);

  // Create group for xLabels: x-axis label
  var xLabels = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`)
      .classed("atext", true)
      .attr("id", "xLabels");

  // Create text of the x-axis label
  xLabels.selectAll("text")
      .data(xAxisLabels)
      .enter()
      .append("text")
      .attr("x", 0)
      .attr("y", (d,i) => (i+1)*axisPadding)
      .attr("value", d => d) // value to grab for event listener
      .classed("active", d => (d === chosenXAxis) ? true:false)
      .classed("inactive", d => (d === chosenXAxis) ? false:true)
      .text(d => labelsTitle[d]);

  // Create group for yLabels: y-axis labels
  var yLabels = chartGroup.append("g")
      .attr("transform", `rotate(-90 ${(margin.left/2)} ${(height/2)+60})`)
      .classed("atext", true)
      .attr("id", "yLabels");
  
      // // Create text of the y-axis label
  yLabels.selectAll("text")
      .data(yAxisLabels)
      .enter()
      .append("text")
      .attr("x", margin.top)
      .attr("y", (d,i) => (i+1)*axisPadding)
      .attr("value", d => d) // value to grab for event listener
      .classed("active", d => (d === chosenYAxis) ? true:false)
      .classed("inactive", d => (d === chosenYAxis) ? false:true)
      .text(d => labelsTitle[d]);
      // .on("click", updateChart);

  // updateToolTip function
  var elemEnter = updateToolTip(chosenXAxis, chosenYAxis, elemEnter);
};

// Load data from data.csv
d3.csv("/assets/data/data.csv").then((data, error) => {
  // Throw an error if one occurs
  if (error) throw error;

  // Parse data: Cast the data values to a number
  data.forEach(d => {
    d.poverty = +d.poverty;
    d.age = +d.age;
    d.income = +d.income;
    d.obesity = +d.obesity;
    d.healthcare = +d.healthcare;
    d.smokes = +d.smokes;
  });

  // Load data into journalism
  journalism = data;
  // Initialize scatter chart
  init();
});