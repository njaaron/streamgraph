import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
function StreamVisualization({ data }) {
  const svgRef = useRef();
  const tooltipRef = useRef();
  useEffect(() => {
    const margin = { top: 20, right: 150, bottom: 30, left: 50 };
    const width = 700 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    d3.select(svgRef.current).selectAll("*").remove();
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    const parseDate = d3.timeParse("%m/%d/%y");
    data.forEach(d => (d.Date = parseDate(d.Date)));
    data.sort((a, b) => a.Date - b.Date);
    const keys = ["GPT-4", "Gemini", "PaLM-2", "Claude", "LLaMA-3.1"];
    const colors = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00"];
    const stack = d3.stack()
      .keys(keys)
      .offset(d3.stackOffsetWiggle);
    const stackedData = stack(data);
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.Date))
      .range([0, width]);
    const yExtent = [
      d3.min(stackedData, layer => d3.min(layer, d => d[0])),
      d3.max(stackedData, layer => d3.max(layer, d => d[1]))
    ];
    const yScale = d3.scaleLinear()
      .domain(yExtent)
      .range([height, 0]);
    const area = d3.area()
      .x(d => xScale(d.data.Date))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
      .curve(d3.curveBasis);
    g.selectAll(".layer")
      .data(stackedData)
      .enter().append("path")
      .attr("class", "layer")
      .attr("d", area)
      .style("fill", (d, i) => colors[i])
      .on("mousemove", function (event, d) {
        const model = keys[stackedData.indexOf(d)];
        showTooltip(event, model);
      })
      .on("mouseout", hideTooltip);
    const xAxis = d3.axisBottom(xScale)
      .ticks(d3.timeMonth.every(1))
      .tickFormat(d3.timeFormat("%b"));
    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);
    const legend = svg.append("g")
      .attr("transform", `translate(${width + 100}, ${margin.top + 170})`)
      .selectAll(".legend")
      .data([...keys].reverse())
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(0, ${i * 25})`);
    legend.append("rect")
      .attr("x", 0)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", (d, i) => colors[keys.indexOf(d)]);
    legend.append("text")
      .attr("x", 25)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .text(d => d)
      .style("font-size", "12px");
    function showTooltip(event, model) {
      const tooltip = d3.select(tooltipRef.current);
      tooltip.style("display", "block")
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY + 10}px`);
      drawMiniBarChart(model);
    }
    function hideTooltip() {
      const tooltip = d3.select(tooltipRef.current);
      tooltip.style("display", "none");
      tooltip.selectAll("*").remove();
    }
    function drawMiniBarChart(model) {
      const tooltip = d3.select(tooltipRef.current);
      tooltip.selectAll("*").remove();
      const miniWidth = 300;
      const miniHeight = 150;
      const miniMargin = { top: 20, right: 20, bottom: 30, left: 40 };
      const miniSvg = tooltip.append("svg")
        .attr("width", miniWidth)
        .attr("height", miniHeight);
      const miniG = miniSvg.append("g")
        .attr("transform", `translate(${miniMargin.left},${miniMargin.top})`);
      const miniXScale = d3.scaleBand()
        .domain(data.map(d => d3.timeFormat("%b")(d.Date)))
        .range([0, miniWidth - miniMargin.left - miniMargin.right])
        .padding(0.2);
      const miniYScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[model])])
        .range([miniHeight - miniMargin.top - miniMargin.bottom, 0]);
      miniG.append("g")
        .attr("transform", `translate(0, ${miniHeight - miniMargin.top - miniMargin.bottom})`)
        .call(d3.axisBottom(miniXScale));
      miniG.append("g")
        .call(d3.axisLeft(miniYScale));
      miniG.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => miniXScale(d3.timeFormat("%b")(d.Date)))
        .attr("y", d => miniYScale(d[model]))
        .attr("width", miniXScale.bandwidth())
        .attr("height", d => miniHeight - miniMargin.top - miniMargin.bottom - miniYScale(d[model]))
        .attr("fill", colors[keys.indexOf(model)]);
    }
  }, [data]);
  return (
    <div style={{ position: "relative" }}>
      <svg ref={svgRef}></svg>
      <div className="tooltip" ref={tooltipRef}></div>
    </div>
  );
}
export default StreamVisualization;