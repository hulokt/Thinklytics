import React, { useMemo } from 'react';

// Lightweight SVG-based chart components to replace Chart.js

export const SimpleBarChart = ({ 
  data = [], 
  width = 400, 
  height = 300,
  title = '',
  xKey = 'label',
  yKey = 'value',
  color = '#3b82f6'
}) => {
  const chartData = useMemo(() => {
    if (!data.length) return [];
    
    const maxValue = Math.max(...data.map(d => d[yKey] || 0));
    const padding = 40;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    return data.map((item, index) => ({
      ...item,
      x: padding + (index * chartWidth) / data.length,
      y: padding + chartHeight - ((item[yKey] || 0) / maxValue) * chartHeight,
      width: chartWidth / data.length * 0.8,
      height: ((item[yKey] || 0) / maxValue) * chartHeight
    }));
  }, [data, width, height, yKey]);
  
  return (
    <div className="homepage-card p-4 rounded-lg">
      {title && <h3 className="text-lg font-semibold homepage-text-primary mb-4">{title}</h3>}
      <svg width={width} height={height} className="overflow-visible">
        {/* Y-axis */}
        <line x1="40" y1="40" x2="40" y2={height - 40} stroke="#e5e7eb" strokeWidth="1" />
        
        {/* X-axis */}
        <line x1="40" y1={height - 40} x2={width - 40} y2={height - 40} stroke="#e5e7eb" strokeWidth="1" />
        
        {/* Bars */}
        {chartData.map((item, index) => (
          <g key={index}>
            <rect
              x={item.x}
              y={item.y}
              width={item.width}
              height={item.height}
              fill={color}
              className="opacity-80 hover:opacity-100 transition-opacity"
              rx="2"
            />
            
            {/* Value labels */}
            <text
              x={item.x + item.width / 2}
              y={item.y - 5}
              textAnchor="middle"
              className="text-xs fill-gray-600 dark:fill-gray-400"
            >
              {item[yKey]}
            </text>
            
            {/* X-axis labels */}
            <text
              x={item.x + item.width / 2}
              y={height - 20}
              textAnchor="middle"
              className="text-xs fill-gray-600 dark:fill-gray-400"
            >
              {item[xKey]?.length > 8 ? item[xKey].substring(0, 8) + '...' : item[xKey]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export const SimpleLineChart = ({ 
  data = [], 
  width = 400, 
  height = 300,
  title = '',
  xKey = 'label',
  yKey = 'value',
  color = '#10b981'
}) => {
  const { points, maxValue } = useMemo(() => {
    if (!data.length) return { points: [], maxValue: 0 };
    
    const max = Math.max(...data.map(d => d[yKey] || 0));
    const padding = 40;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    const pts = data.map((item, index) => ({
      x: padding + (index * chartWidth) / (data.length - 1),
      y: padding + chartHeight - ((item[yKey] || 0) / max) * chartHeight,
      value: item[yKey],
      label: item[xKey]
    }));
    
    return { points: pts, maxValue: max };
  }, [data, width, height, yKey, xKey]);
  
  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');
  
  return (
    <div className="homepage-card p-4 rounded-lg">
      {title && <h3 className="text-lg font-semibold homepage-text-primary mb-4">{title}</h3>}
      <svg width={width} height={height}>
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Y-axis */}
        <line x1="40" y1="40" x2="40" y2={height - 40} stroke="#e5e7eb" strokeWidth="2" />
        
        {/* X-axis */}
        <line x1="40" y1={height - 40} x2={width - 40} y2={height - 40} stroke="#e5e7eb" strokeWidth="2" />
        
        {/* Line */}
        {points.length > 1 && (
          <path
            d={pathData}
            stroke={color}
            strokeWidth="3"
            fill="none"
            className="drop-shadow-sm"
          />
        )}
        
        {/* Data points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill={color}
              className="hover:r-6 transition-all cursor-pointer"
            />
            
            {/* Value labels on hover */}
            <text
              x={point.x}
              y={point.y - 10}
              textAnchor="middle"
              className="text-xs fill-gray-600 dark:fill-gray-400 opacity-0 hover:opacity-100"
            >
              {point.value}
            </text>
            
            {/* X-axis labels */}
            <text
              x={point.x}
              y={height - 20}
              textAnchor="middle"
              className="text-xs fill-gray-600 dark:fill-gray-400"
            >
              {point.label?.length > 6 ? point.label.substring(0, 6) + '...' : point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export const SimplePieChart = ({ 
  data = [], 
  width = 300, 
  height = 300,
  title = '',
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
}) => {
  const { segments, total } = useMemo(() => {
    const totalValue = data.reduce((sum, item) => sum + (item.value || 0), 0);
    let currentAngle = 0;
    
    const segs = data.map((item, index) => {
      const percentage = (item.value || 0) / totalValue;
      const angle = percentage * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      
      return {
        ...item,
        percentage: Math.round(percentage * 100),
        startAngle,
        endAngle: currentAngle,
        color: colors[index % colors.length]
      };
    });
    
    return { segments: segs, total: totalValue };
  }, [data, colors]);
  
  const radius = Math.min(width, height) / 2 - 20;
  const centerX = width / 2;
  const centerY = height / 2;
  
  return (
    <div className="homepage-card p-4 rounded-lg">
      {title && <h3 className="text-lg font-semibold homepage-text-primary mb-4">{title}</h3>}
      <div className="flex items-center space-x-4">
        <svg width={width} height={height}>
          {segments.map((segment, index) => {
            const startAngleRad = (segment.startAngle - 90) * Math.PI / 180;
            const endAngleRad = (segment.endAngle - 90) * Math.PI / 180;
            
            const x1 = centerX + radius * Math.cos(startAngleRad);
            const y1 = centerY + radius * Math.sin(startAngleRad);
            const x2 = centerX + radius * Math.cos(endAngleRad);
            const y2 = centerY + radius * Math.sin(endAngleRad);
            
            const largeArcFlag = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
            
            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');
            
            return (
              <g key={index} className="hover:opacity-80 transition-opacity cursor-pointer">
                <path
                  d={pathData}
                  fill={segment.color}
                  stroke="white"
                  strokeWidth="2"
                />
                
                {/* Percentage labels */}
                {segment.percentage > 5 && (
                  <text
                    x={centerX + (radius * 0.7) * Math.cos((startAngleRad + endAngleRad) / 2)}
                    y={centerY + (radius * 0.7) * Math.sin((startAngleRad + endAngleRad) / 2)}
                    textAnchor="middle"
                    className="text-xs font-semibold fill-white"
                  >
                    {segment.percentage}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        
        {/* Legend */}
        <div className="space-y-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm homepage-text-secondary">
                {segment.label} ({segment.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 