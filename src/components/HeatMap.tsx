import * as d3 from 'd3';

import React, { useEffect, useRef } from 'react';

interface HeatMapProps {
  data: {
    features: string[];
    matrix: number[][];
  };
  title?: string;
  width?: number;
  height?: number;
}

const HeatMap: React.FC<HeatMapProps> = ({
  data,
  title = 'Correlation Matrix',
  width = 500,
  height = 500,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data || !data.features || !data.matrix) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 50, right: 70, bottom: 100, left: 100 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleBand().range([0, chartWidth]).domain(data.features).padding(0.01);

    const yScale = d3.scaleBand().range([0, chartHeight]).domain(data.features).padding(0.01);

    // Color scale: from blue to red
    const colorScale = d3.scaleSequential().interpolator(d3.interpolateRdBu).domain([-1, 1]);

    // Create and populate the heatmap
    svg
      .selectAll()
      .data(data.features)
      .enter()
      .append('g')
      .selectAll('rect')
      .data((feature, i) => {
        return data.features.map((f, j) => {
          return {
            x: f,
            y: feature,
            value: data.matrix[i][j],
          };
        });
      })
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.x) || 0)
      .attr('y', (d) => yScale(d.y) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .style('fill', (d) => colorScale(d.value))
      .on('mouseover', function (event, d) {
        // Handle hover effect
        d3.select(this).style('stroke', 'black');

        // Show tooltip
        tooltip
          .style('opacity', 1)
          .html(`${d.y} vs ${d.x}: ${d.value.toFixed(2)}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', function () {
        d3.select(this).style('stroke', 'none');
        tooltip.style('opacity', 0);
      });

    // Add X axis
    svg
      .append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-65)');

    // Add Y axis
    svg.append('g').call(d3.axisLeft(yScale));

    // Add title
    svg
      .append('text')
      .attr('x', chartWidth / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text(title);

    // Add color scale legend
    const legendWidth = 20;
    const legendHeight = chartHeight;

    const legendScale = d3.scaleSequential().interpolator(d3.interpolateRdBu).domain([-1, 1]);

    // Create gradient
    const defs = svg.append('defs');

    const gradient = defs
      .append('linearGradient')
      .attr('id', 'color-gradient')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '0%')
      .attr('y2', '0%');

    gradient.append('stop').attr('offset', '0%').attr('stop-color', legendScale(-1));

    gradient.append('stop').attr('offset', '50%').attr('stop-color', legendScale(0));

    gradient.append('stop').attr('offset', '100%').attr('stop-color', legendScale(1));

    // Add legend rectangle
    svg
      .append('rect')
      .attr('x', chartWidth + 10)
      .attr('y', 0)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#color-gradient)');

    // Add legend axis
    const legendAxis = d3
      .scaleLinear()
      .domain([-1, 0, 1])
      .range([legendHeight, legendHeight / 2, 0]);

    svg
      .append('g')
      .attr('transform', `translate(${chartWidth + 10 + legendWidth},0)`)
      .call(d3.axisRight(legendAxis).ticks(5));

    // Add tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', 'solid 1px #ddd')
      .style('border-radius', '5px')
      .style('padding', '10px')
      .style('pointer-events', 'none');

    // Cleanup function
    return () => {
      d3.select('body').selectAll('.tooltip').remove();
    };
  }, [data, width, height, title]);

  return (
    <div className="heatmap-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default HeatMap;
