import React, { useRef, useEffect, useState, useMemo } from 'react';
import type { Country } from '../types';

// Declare global variables provided by CDN scripts
declare const d3: any;
declare const topojson: any;

interface WorldMapProps {
  countries: Country[];
  onCountrySelect: (country: Country | null) => void;
  selectedCountry: Country | null;
  hqCountryName: string | null;
  operatingCountryNames: string[];
}

const WorldMap: React.FC<WorldMapProps> = ({ countries, onCountrySelect, selectedCountry, hqCountryName, operatingCountryNames }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize a map for efficient country lookup by ccn3 code
  const countriesByCcn3 = useMemo(() => {
    const map = new Map<string, Country>();
    countries.forEach(c => c.ccn3 && map.set(c.ccn3, c));
    return map;
  }, [countries]);

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
       })
      .then(data => {
        setGeoData(topojson.feature(data, data.objects.countries));
        setIsLoading(false);
      })
      .catch(error => {
          console.error("Error loading map data:", error);
          setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (isLoading || !geoData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous renders
    
    // Use a fixed viewBox for responsive scaling, fixing the rendering issue.
    const width = 960;
    const height = 600;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const projection = d3.geoMercator()
      .scale(150)
      .center([0, 30]) // Center map vertically
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const g = svg.append("g");

    g.selectAll("path")
      .data(geoData.features)
      .enter().append("path")
      .attr("d", path)
      .attr("fill", (d: any) => {
        const countryData = countriesByCcn3.get(d.id);
        const isSelected = selectedCountry && d.id === selectedCountry.id;
        if (isSelected) return '#0ea5e9'; // sky-500 for selected

        if (countryData) {
            if (countryData.name.common === hqCountryName) return '#10b981'; // emerald-500 for HQ
            if (operatingCountryNames.includes(countryData.name.common)) return '#f59e0b'; // amber-500 for operating
            return '#475569'; // slate-600 for available
        }
        return '#334155'; // slate-700 for Inactive (e.g. Antarctica)
      })
      .attr("stroke", "#1e293b") // slate-800
      .attr("stroke-width", 0.5)
      .style("cursor", (d: any) => countriesByCcn3.has(d.id) ? "pointer" : "not-allowed")
      .on("mouseover", function (event: any, d: any) {
        const isSelected = selectedCountry && d.id === selectedCountry.id;
        if (!isSelected && countriesByCcn3.has(d.id)) {
          d3.select(this).attr("fill", "#64748b"); // slate-500 on hover
        }
      })
      .on("mouseout", function (event: any, d: any) {
        const countryData = countriesByCcn3.get(d.id);
        const isSelected = selectedCountry && d.id === selectedCountry.id;
         if (!isSelected && countryData) {
            if (countryData.name.common === hqCountryName) {
                d3.select(this).attr("fill", "#10b981");
            } else if (operatingCountryNames.includes(countryData.name.common)) {
                d3.select(this).attr("fill", "#f59e0b");
            } else {
                d3.select(this).attr("fill", "#475569");
            }
        }
      })
      .on("click", (event: any, d: any) => {
        const countryData = countriesByCcn3.get(d.id);
        if(countryData) {
            // Add the map 'id' to the country data for selection tracking
            onCountrySelect({...countryData, id: d.id});
        }
      });
      
      const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', (event: any) => {
            g.attr('transform', event.transform);
        });

      svg.call(zoom);

  }, [geoData, isLoading, countriesByCcn3, onCountrySelect, selectedCountry, hqCountryName, operatingCountryNames]);

  if (isLoading) {
    return <div className="text-center">지도 로딩 중...</div>;
  }

  return (
    <svg ref={svgRef} className="w-full h-full"></svg>
  );
};

export default WorldMap;