import React, { Component } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { api } from '../server/api';

const divStyle = {
  margin: '0 auto'
};

export default class TestBreakdown extends Component<
  { data: api.TestData },
  {}
> {
  render() {
    const {
      totalPassed,
      totalSkipped,
      totalWarnings,
      totalFailed
    } = this.props.data;

    const COLORS = [
      'hsl(141, 53%, 53%)',
      'hsl(0, 0%, 71%)',
      'hsl(48, 100%, 67%)',
      'hsl(348, 86%, 61%)'
    ];

    const data = [
      { name: 'Passed', value: totalPassed ? totalPassed : 0 },
      { name: 'Skipped', value: totalSkipped ? totalSkipped : 0 },
      { name: 'Warnings', value: totalWarnings ? totalWarnings : 0 },
      { name: 'Failed', value: totalFailed ? totalFailed : 0 }
    ];

    return (
      <PieChart width={280} height={340} style={divStyle}>
        <Pie
          data={data}
          dataKey={'value'}
          cx={140}
          cy={170}
          innerRadius={60}
          outerRadius={130}
          fill={'#8884d8'}
        >
          {data.map((entry, index) => (
            <Cell fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    );
  }
}
