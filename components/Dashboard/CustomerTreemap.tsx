'use client';

import React from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';

const customerData = [
  {
    name: 'Customer Segment 1',
    children: [
      { name: 'Customer 5', size: 400 },
      { name: 'Customer 4', size: 300 },
      { name: 'Customer 1', size: 150 },
      { name: 'Customer 3', size: 150 },
      { name: 'Customer 6', size: 100 },
      { name: 'Customer 2', size: 100 },
    ],
  },
  {
    name: 'Customer Segment 2',
    children: [
      { name: 'Customer 11', size: 250 },
      { name: 'Customer 8', size: 120 },
      { name: 'Customer 10', size: 120 },
      { name: 'Customer 9', size: 110 },
    ],
  },
  {
    name: 'Customer Segment 3',
    children: [
      { name: 'Customer 14', size: 200 },
      { name: 'Customer 13', size: 100 },
      { name: 'Customer 12', size: 100 },
      { name: 'Customer 15', size: 50 },
    ],
  },
];

const COLORS = [
  '#6366f1', // Whales
  '#ec4899', // High Value
  '#14b8a6', // Loyal
  '#f59e0b', // Recent
  '#8b5cf6', // Occasional
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl shadow-2xl">
        <p className="text-white font-bold text-sm mb-1">{data.name}</p>
        <p className="text-zinc-400 text-xs">
          Revenue: <span className="text-white font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(payload[0].value)}</span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomizedContent = (props: any) => {
  const { root, depth, x, y, width, height, index, name, onMouseEnter, onMouseLeave } = props;

  return (
    <g onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: depth === 1 ? COLORS[index % COLORS.length] : (depth === 2 ? 'rgba(0,0,0,0.1)' : 'none'),
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {depth === 1 ? (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={14}
          fontWeight="bold"
          opacity={0.3}
        >
          {name}
        </text>
      ) : null}
      {depth === 2 && width > 40 && height > 20 ? (
        <text
          x={x + 4}
          y={y + 14}
          fill="#fff"
          fontSize={11}
          fontWeight="bold"
        >
          {name}
        </text>
      ) : null}
    </g>
  );
};

export function CustomerTreemap({ data = customerData }: { data?: any[] }) {
  return (
    <div className="h-[600px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="#fff"
          fill="#8884d8"
          content={<CustomizedContent />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
