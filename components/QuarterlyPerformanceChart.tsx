import React, { useRef, useEffect } from 'react';
import type { QuarterlyFinancials } from '../types';

declare const d3: any;

interface QuarterlyPerformanceChartProps {
  data: QuarterlyFinancials[];
}

const QuarterlyPerformanceChart: React.FC<QuarterlyPerformanceChartProps> = ({ data }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!data || data.length === 0 || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = 800;
        const height = 400;
        const margin = { top: 40, right: 30, bottom: 60, left: 80 };

        const subgroups = ['revenue', 'totalExpenses', 'netIncome'];
        const groups = data.map(d => {
            const date = new Date(d.date);
            return `Q${Math.floor(date.getUTCMonth() / 3) + 1} ${date.getUTCFullYear()}`;
        });
        
        const chartData = data.map(d => ({
            ...d,
            totalExpenses: d.costOfGoodsSold + d.operatingExpenses,
        }));


        const x = d3.scaleBand()
            .domain(groups)
            .range([margin.left, width - margin.right])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([
                Math.min(0, d3.min(chartData, (d:any) => d.netIncome) * 1.1 || 0),
                d3.max(chartData, (d:any) => d.revenue) * 1.1 || 0
            ])
            .range([height - margin.bottom, margin.top]);
            
        svg.attr("viewBox", `0 0 ${width} ${height}`);

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-45)")
                .style("fill", "#94a3b8");
        
        svg.append("g")
            .attr("transform", `translate(0,${y(0)})`)
            .append("line")
            .attr("x1", margin.left)
            .attr("x2", width - margin.right)
            .attr("stroke", "#475569")
            .attr("stroke-width", 1);


        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(8).tickFormat((d:any) => {
                 if (d === 0) return '$0';
                 return `$${(d/1000000).toFixed(1)}M`
            }))
            .selectAll("text").style("fill", "#94a3b8");

        const xSubgroup = d3.scaleBand()
            .domain(subgroups)
            .range([0, x.bandwidth()])
            .padding([0.05]);

        const color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(['#22c55e', '#f59e0b', '#38bdf8']);

        const tooltip = d3.select("body").append("div")
            .attr("class", "d3-tooltip")
            .style("position", "absolute")
            .style("z-index", "100")
            .style("visibility", "hidden")
            .style("padding", "10px")
            .style("background", "rgba(0,0,0,0.8)")
            .style("border-radius", "5px")
            .style("color", "#fff")
            .style("font-size", "12px");

        svg.append("g")
            .selectAll("g")
            .data(chartData)
            .join("g")
                .attr("transform", (d, i) => `translate(${x(groups[i])},0)`)
            .selectAll("rect")
            .data(function(d:any) { return subgroups.map(key => ({ key: key, value: d[key] })); })
            .join("rect")
                .attr("x", (d:any) => xSubgroup(d.key))
                .attr("y", (d:any) => y(Math.max(0, d.value)))
                .attr("height", (d:any) => Math.abs(y(d.value) - y(0)))
                .attr("width", xSubgroup.bandwidth())
                .attr("fill", (d:any) => {
                    if (d.key === 'netIncome' && d.value < 0) return '#ef4444'; // red-500 for loss
                    return color(d.key) as string;
                })
                .on("mouseover", function(event:any, d:any) {
                    const keyName = d.key === 'revenue' ? '매출' : d.key === 'totalExpenses' ? '총 비용' : '순이익';
                    tooltip.html(`<strong>${keyName}</strong><br>$${d.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`)
                        .style("visibility", "visible");
                    d3.select(this).style("opacity", 0.7);
                })
                .on("mousemove", function(event:any) {
                    tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
                })
                .on("mouseout", function() {
                    tooltip.style("visibility", "hidden");
                    d3.select(this).style("opacity", 1);
                });

        // Legend
        const legendData = [
            { key: 'revenue', name: '매출' },
            { key: 'totalExpenses', name: '총 비용' },
            { key: 'netIncome', name: '순이익' },
        ];
        const legend = svg.selectAll(".legend")
            .data(legendData)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(${i * 100}, 0)`);

        legend.append("rect")
            .attr("x", margin.left)
            .attr("y", 10)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", (d:any) => color(d.key) as string);

        legend.append("text")
            .attr("x", margin.left + 24)
            .attr("y", 20)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .style("fill", "#e2e8f0")
            .style("font-size", "12px")
            .text((d:any) => d.name);

    }, [data]);

    useEffect(() => {
        // Cleanup tooltip when component unmounts
        return () => {
            d3.select(".d3-tooltip").remove();
        };
    }, []);

    return (
        <div>
            {(!data || data.length === 0) ? (
                <div className="text-center text-slate-500 py-16 bg-slate-800/50 rounded-lg">
                    <p>분기별 실적 데이터가 없습니다.</p>
                    <p className="text-sm mt-2">게임을 진행하여 최소 한 분기가 지나면 데이터가 표시됩니다.</p>
                </div>
            ) : (
                <svg ref={svgRef}></svg>
            )}
        </div>
    );
};

export default QuarterlyPerformanceChart;
