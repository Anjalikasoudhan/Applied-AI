import React from 'react';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { motion } from 'framer-motion';

// This component renders two charts side by side:
// 1. A radial gauge showing the overall match score (like a speedometer)
// 2. A horizontal bar chart showing category-wise breakdown

const MatchScoreChart = ({ score, categoryScores }) => {

  // Decide the gauge color based on the score value
  const getScoreColor = (s) => {
    if (s >= 80) return '#22c55e';  // green
    if (s >= 60) return '#f59e0b';  // amber
    return '#ef4444';               // red
  };

  // Data for the radial gauge — Recharts needs an array
  const gaugeData = [
    { name: 'Match', value: score || 0, fill: getScoreColor(score) }
  ];

  // Transform categoryScores object into an array for the bar chart
  const barData = categoryScores ? [
    { name: 'Frontend', score: categoryScores.frontend || 0 },
    { name: 'Backend', score: categoryScores.backend || 0 },
    { name: 'Tools', score: categoryScores.tools || 0 },
    { name: 'Relevance', score: categoryScores.projectRelevance || 0 }
  ] : [];

  // Color each bar based on its individual score
  const getBarColor = (value) => {
    if (value >= 80) return '#22c55e';
    if (value >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

      {/* ====== LEFT: Radial Gauge ====== */}
      <motion.div
        className="bg-card border border-border rounded-3xl p-8 flex flex-col items-center justify-center shadow-sm relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <p className="absolute top-6 left-6 text-sm font-semibold tracking-wide uppercase text-muted-foreground">
          Overall Alignment
        </p>

        {/* The radial chart is a semi-circle (180° to 0°) */}
        <div className="h-[220px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="100%"
              innerRadius="80%"
              outerRadius="110%"
              barSize={16}
              data={gaugeData}
              startAngle={180}
              endAngle={0}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar
                minAngle={15}
                background={{ fill: 'hsl(var(--muted))' }}
                dataKey="value"
                cornerRadius={10}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Big score number overlaid on top of the chart */}
        <div className="absolute bottom-8 flex flex-col items-center">
          <span
            className="text-5xl font-black"
            style={{ color: getScoreColor(score) }}
          >
            {score}%
          </span>
          <span className="text-sm font-medium text-muted-foreground mt-1">
            Match Rate
          </span>
        </div>
      </motion.div>

      {/* ====== RIGHT: Category Bar Chart ====== */}
      <motion.div
        className="bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <p className="text-sm font-semibold tracking-wide uppercase text-muted-foreground mb-6">
          Skill Categories
        </p>

        <div className="flex-1 w-full min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                dataKey="name"
                type="category"
                stroke="hsl(var(--foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Bar
                dataKey="score"
                radius={[0, 6, 6, 0]}
                barSize={28}
                // Color each bar individually using a custom shape
                shape={(props) => {
                  const { x, y, width, height, payload } = props;
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      rx={6}
                      fill={getBarColor(payload.score)}
                    />
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default MatchScoreChart;
