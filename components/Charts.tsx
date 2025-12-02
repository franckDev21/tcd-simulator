import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { UserResult } from '../types';

interface ScoreHistoryChartProps {
  data: UserResult[];
}

export const ScoreHistoryChart: React.FC<ScoreHistoryChartProps> = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            hide 
            domain={[0, 699]}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
            itemStyle={{ color: '#818cf8' }}
          />
          <ReferenceLine y={399} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" label={{ value: "Niveau B2", position: 'insideTopRight', fill: '#94a3b8', fontSize: 10 }} />
          <Area 
            type="monotone" 
            dataKey="score" 
            stroke="#818cf8" 
            fillOpacity={1} 
            fill="url(#colorScore)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};