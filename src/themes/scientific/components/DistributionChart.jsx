import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const DistributionChart = ({ score }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = 250;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Sample distribution data - Editorial Palette
    const bins = [
      { range: '0-10', count: 12, color: '#E5E5E5' },
      { range: '10-20', count: 18, color: '#E5E5E5' },
      { range: '20-30', count: 15, color: '#E5E5E5' },
      { range: '30-40', count: 22, color: '#D4D4D4' },
      { range: '40-50', count: 28, color: '#D4D4D4' },
      { range: '50-60', count: 19, color: '#A3A3A3' },
      { range: '60-70', count: 14, color: '#737373' },
      { range: '70-80', count: 9, color: '#DC2626' }, // Warning Level
      { range: '80-90', count: 5, color: '#991B1B' }, // Severe
      { range: '90-100', count: 3, color: '#7F1D1D' } // Critical
    ];

    // Add current score indicator
    const currentBinIndex = Math.floor(score / 10);

    // Scales
    const x = d3.scaleBand()
      .domain(bins.map(d => d.range))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.count)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Bars
    svg.selectAll('rect')
      .data(bins)
      .join('rect')
      .attr('x', d => x(d.range))
      .attr('y', d => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', d => y(0) - y(d.count))
      .attr('fill', (d, i) => i === currentBinIndex ? '#DC2626' : d.color)
      .attr('opacity', (d, i) => i === currentBinIndex ? 1 : 0.8)
      .attr('stroke', (d, i) => i === currentBinIndex ? '#7F1D1D' : 'none')
      .attr('stroke-width', 2);

    // X Axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .attr('class', 'axis')
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    // Y Axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5))
      .attr('class', 'axis');

    // Y Axis Label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 15)
      .attr('x', -(height / 2))
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#6B7280')
      .text('Frequency');

    // Current score marker
    if (currentBinIndex >= 0 && currentBinIndex < bins.length) {
      svg.append('text')
        .attr('x', x(bins[currentBinIndex].range) + x.bandwidth() / 2)
        .attr('y', y(bins[currentBinIndex].count) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-weight', '600')
        .style('fill', '#3B82F6')
        .text(`Current: ${score}`);
    }

  }, [score]);

  return (
    <div className="sci-chart">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default DistributionChart;
