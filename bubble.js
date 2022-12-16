const file = 'https://raw.githubusercontent.com/danmao124/pruv/main/processed_data/2010/December.json';
const file2 = 'https://raw.githubusercontent.com/danmao124/pruv/main/processed_data/2011/December.json';
const file3 = 'https://raw.githubusercontent.com/danmao124/pruv/main/processed_data/2012/December.json';
const file4 = 'https://raw.githubusercontent.com/danmao124/pruv/main/processed_data/2013/December.json';
const file5 = 'https://raw.githubusercontent.com/danmao124/pruv/main/processed_data/2014/December.json';
const file6 = 'https://raw.githubusercontent.com/danmao124/pruv/main/processed_data/2015/December.json';
const width = window.innerWidth;
const height = window.innerHeight - 190;
var colors = d3.scaleOrdinal(["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"]);
var svg = d3.select('#bubble-chart')
  .style('width', width)
  .style('height', height);
var pack = d3.pack()
  .size([width, height])
  .padding(1.5);
var format = d3.format(",d");
var month = "January";
var year2 = "2010";
var allGroup = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var fetching = false;

const queryString = window.location.search;
if (queryString.length > 0) {
  var parts = queryString.slice(1).split('-');
  month = parts[0]
  year2 = parts[1]
}

// Time
var dataTime = d3.range(0, 11).map(function (d) {
  return new Date(2009 + d, 12, 10);
});
var bb = new Date(year2 + " " + month)
console.log(bb.getFullYear())
console.log(bb.getMonth())

var sliderTime = d3
  .sliderBottom()
  .min(d3.min(dataTime))
  .max(new Date(2019, 12, 1))
  .step(30 * 60 * 60 * 24 * 1000)
  .width(window.innerWidth - 75)
  .tickFormat(d3.timeFormat('%Y'))
  .tickValues(dataTime)
  .default(bb)
  .on('onchange', val => {
    d3.select('p#value-time').text(d3.timeFormat('%B %Y')(val));

    if (year2 == d3.timeFormat('%Y')(val) && month == d3.timeFormat('%B')(val))
      return;

    year2 = d3.timeFormat('%Y')(val);
    month = d3.timeFormat('%B')(val);
    fetchFile(month, year2);
  });

var gTime = d3
  .select('div#slider-time')
  .append('svg')
  .attr('width', window.innerWidth)
  .attr('height', 100)
  .append('g')
  .attr('transform', 'translate(30,30)');

gTime.call(sliderTime);
d3.select('p#value-time').text(d3.timeFormat('%B %Y')(sliderTime.value()));

fetchFile(month, year2);

function redraw(classes) {
  // transition
  var t = d3.transition()
    .duration(1000);
  //console.log(classes)
  // hierarchy
  var h = d3.hierarchy(classes)
    .sum(function (d) { return d.probability; })

  //JOIN
  var circle = svg.selectAll("circle")
    .data(pack(h).leaves(), function (d) { return d.data.term; });

  var text = svg.selectAll("text")
    .data(pack(h).leaves(), function (d) { return d.data.term; });

  //EXIT
  circle.exit()
    .style("fill", "#b26745")
    .transition(t)
    .attr("r", 1e-6)
    .remove();

  text.exit()
    .transition(t)
    .attr("opacity", 1e-6)
    .remove();

  // text.selectAll("tspan").attr("opacity", 1e-6).exit().remove();

  //UPDATE
  circle
    .transition(t)
    .style('fill', d => colors(d.data.topic))
    .attr("r", function (d) { return d.r })
    .attr("cx", function (d) { return d.x; })
    .attr("cy", function (d) { return d.y; })

  text.transition(t)
    .attr("x", function (d) { return d.x; })
    .attr("y", function (d) { return d.y; });

  // text.append("tspan")
  //   .attr("x", function (d) { return d.x; })
  //   .attr("y", function (d) { return d.y; })
  //   .attr("dy", "1.2em")
  //   .text(function (d) { return Math.ceil(d.value * 10000) / 10000; })

  //ENTER
  circle.enter().append("circle")
    .attr("r", 1e-6)
    .attr("cx", function (d) { return d.x; })
    .attr("cy", function (d) { return d.y; })
    .style("fill", "#fff")
    .transition(t)
    .style('fill', d => colors(d.data.topic))
    .attr("r", function (d) { return d.r });

  text.enter().append("text")
    .attr("opacity", 1e-6)
    .attr("x", function (d) { return d.x; })
    .attr("y", function (d) { return d.y; })
    .attr("dy", "0em")
    .style("font-size", "12px")
    .text(function (d) { return d.data.term })
    .transition(t)
    .attr("opacity", 1);

  // text.enter().append("text")
  //   .attr("opacity", 1e-6)
  //   .attr("x", function (d) { return d.x; })
  //   .attr("y", function (d) { return d.y; })
  //   .attr("dy", "1.2em")
  //   .text(function (d) { return Math.ceil(d.value * 10000) / 10000; })
  //   .transition(t)
  //   .attr("opacity", 1);  
}

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

var stats_file = undefined
async function fetchFile(month, year) {
  if (fetching)
    return;

  window.history.pushState('lol', '', '?' + month + '-' + year);

  fetching = true;
  var filename = 'https://raw.githubusercontent.com/danmao124/pruv/main/processed_data/' + year + '/' + month + '.json';
  data = await d3.json(filename).then(data => data);
  grouping = d3.group(data.data, d => d.topic)
  redraw(grouping);

  if (stats_file == undefined) {
    var filename = 'https://raw.githubusercontent.com/danmao124/pruv/main/processed_data/lines/data.json';
    data = await d3.json(filename).then(data => data);
    stats_file = data
  }

  for (let i = 0; i < stats_file.length; i++) {
    var stat = stats_file[i];
    var parts = stat.date.split('-');
    var mydate = new Date(parts[0], parts[1] - 1, 1);
    if (d3.timeFormat('%Y')(mydate) == year && d3.timeFormat('%B')(mydate) == month) {
      d3.select('#stats').text("Total votes: " + stat.score);
      d3.select('#stats2').text("Total comments: " + stat.comments);
      break;
    }
  }

  console.log(grouping)
  fetching = false;
};

