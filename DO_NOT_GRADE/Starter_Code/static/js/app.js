const subjectData =  data;

//add the ul for the demographic data
var ul = d3.select("#sample-metadata").append('ul');

let subjects = subjectData.names.map(function(row) {
    return row;
  });

let subjectDD = d3.select("#selDataset");

subjectDD.append("option").text("--Select a Subject--");

// add the subjects to the select list
subjects.forEach(function(row) {
	// create the drop down menu of subjects
	subjectDD
    .append("option")
		.text(row)
    });

// reference UCF Bootcamp Interactive Viz Lecture Day 2 - Activity 7
d3.selectAll("body").on("change", updatePage);

//Update the visualizations based on the subject selected
function updatePage(){
  // get the selected subject Id
  let subjectId = subjectDD.property("value");
  // console.log(subjectId);

  if (subjectId != "--Select a Subject--") {
    //Prevent the page from reloading with D3
    d3.event.preventDefault();
   }
   else{
     subjectId = "940";
     console.log("subject if/else");
   };

  // filter based on the selected subject id
  let filtered = subjectData.samples.filter(it  => it.id===subjectId)[0];

  subjectId =parseInt(subjectId);

  let filteredMetadata = subjectData.metadata.filter(it  => it.id===subjectId)[0];

  let id = filteredMetadata.id;
  let ethnicity = filteredMetadata.ethnicity;
  let gender = filteredMetadata.gender;
  let age = filteredMetadata.age;
  let loc = filteredMetadata.location;
  let bbtype = filteredMetadata.bbtype;
  let wfreq = filteredMetadata.wfreq;

  // get the data for the selected subject
  let otu_ids = filtered.otu_ids;
  let sample_values = filtered.sample_values;
  let otu_labels = filtered.otu_labels;

  // Source reference 
  // https://stackoverflow.com/questions/11499268/sort-two-arrays-the-same-way
  // https://stackoverflow.com/questions/6129952/javascript-sort-array-by-two-fields 

  //1) combine the arrays:
  var list = [];
  for (var j = 0; j < otu_ids.length; j++) 
      list.push({'sample_values':sample_values[j],'otu_ids':otu_ids[j],'otu_labels':otu_labels[j]});

  //2) sort:
  list.sort((a, b) => b.sample_values -  a.sample_values || b.otu_ids - a.otu_ids);

  //3) separate them back out:
  for (var k = 0; k < list.length; k++) {
      sample_values[k] = list[k].sample_values;
      otu_ids[k] = list[k].otu_ids;
      otu_labels[k] = list[k].otu_labels;
  };

  new_otu_ids = [...otu_ids];
  new_otu_ids.forEach((x,i) => {new_otu_ids[i] = 'OTU '+x;});
  top_otu_ids = new_otu_ids.slice(0,10).reverse();
  top_sample_values = sample_values.slice(0,10).reverse();
  top_otu_labels = otu_labels.slice(0,10).reverse();

  // Create a horizontal bar chart for the top 10 belly button bacteria.
  let trace1 = {
      x: top_sample_values,
      y: top_otu_ids,
      type: "bar",
      orientation: "h",
      text: top_otu_labels//,
  };

  let content = [trace1];

  let layout = {
      yaxis:{title:"OTU ID"},
      xaxis:{title:"Sample Values"}
  };

  Plotly.newPlot("bar",content,layout);

  // Create a bubble chart that displays each sample
  let trace2 = {
      x: otu_ids,
      y: sample_values,
      mode: "markers",
      text: otu_labels,
      marker: {size: sample_values,
              color: otu_ids}
  };

  let content2 = [trace2];

  let layout2 = {
      xaxis:{title:"OTU IDs"} 
  }

  Plotly.newPlot("bubble",content2,layout2);

  let demoInfo = [];

  demoInfo.push(`id: ${id}`);
  demoInfo.push(`ethnicity: ${ethnicity}`);
  demoInfo.push(`gender: ${gender}`);
  demoInfo.push(`age: ${age}`);
  demoInfo.push(`loc: ${loc}`);
  demoInfo.push(`bbtype: ${bbtype}`);
  demoInfo.push(`wfreq: ${wfreq}`);

  //append the demographic data to the ul
  ul.selectAll("li").remove();
  ul.selectAll("li")
  .data(demoInfo)
  .enter()
  .append('li')
  .text(function(d){ return d;});

  // source reference 
  //https://code.tutsplus.com/tutorials/create-interactive-charts-using-plotlyjs-pie-and-gauge-charts--cms-29216
  var traceA = {
      type: "pie",
      showlegend: false,
      hole: 0.4,
      rotation: 90,
      values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
      text: ["0-1", "1-2", "2-3", "3-4", "4-5", "5-6","6-7","7-8","8-9",""],
      direction: "clockwise",
      textinfo: "text",
      textposition: "inside",
      marker: {
        colors: ["rgb(248, 255, 249)",
        "rgb(226, 255, 229)", 
        "rgb(205, 255, 210)",
        "RGB(183, 255, 191)", 
        "RGB(149, 249, 133)", 
        "RGB(77, 237, 48)", 
        "RGB(38, 215, 1)",
        "RGB(0, 195, 1)",
        "RGB(0, 171, 8)",
        "white"]
      },
      labels: ["0-1", "1-2", "2-3", "3-4", "4-5", "5-6","6-7","7-8","8-9",""],
      hoverinfo: "label"
    };

  // 0-9 wash frequency, each represents 20 degrees, move the needle over 180 degrees from 0(right)
  // based on our ranges, each was frequency represents 20 degrees on our gauge/half circle
  let degrees = 180 - (wfreq*20);
 
  //length of needle
  let radius =.2;

  // center offset
  let center = .5;

  // math reference for calculating x & y given the center, degrees and radius
  //https://stackoverflow.com/questions/14096138/find-the-point-on-a-circle-with-given-center-point-radius-and-degree
  // I read a lot of stuff about the unit circles and trig before I found this angel from 
  // programming heaven
  let x = center + radius * Math.cos(degrees*Math.PI/180);
  let y = center + radius * Math.sin(degrees*Math.PI/180);

    var layout4 = {width: 500, height: 400, margin: { t: 40, b: 0},
      shapes:[{
          type: 'line',
          x0: center,
          y0: center,
          x1: x,
          y1: y,
          line: {
            color: 'black',
            width: 3,
            length:1
          }
        }],
      title: "Belly Button Washing Frequency <br> Scrubs per Week",
      xaxis: {visible: false, range: [-1, 1]},
      yaxis: {visible: false, range: [-1, 1]}
    };
    
    var content4 = [traceA];
    
    Plotly.newPlot("gauge", content4, layout4);
}  

updatePage();