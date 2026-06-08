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

const COLORS = ['#6366f1', '#f97316', '#22c55e'];

const CustomizedContent = (props: any) => {
  const { root, depth, x, y, width, height, index, name } = props;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: depth < 2 ? COLORS[index % COLORS.length] : 'none',
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
          fill="#fff"
          fontSize={12}
          fontWeight="bold"
        >
          {name}
        </text>
      ) : null}
      {depth === 2 && width > 40 && height > 20 ? (
        <text
          x={x + 4}
          y={y + 14}
          fill="#fff"
          fontSize={10}
          fontWeight="medium"
        >
          {name}
        </text>
      ) : null}
    </g>
  );
};

export function CustomerTreemap({ data = customerData }: { data?: any[] }) {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="#fff"
          fill="#8884d8"
          content={<CustomizedContent />}
        >
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
