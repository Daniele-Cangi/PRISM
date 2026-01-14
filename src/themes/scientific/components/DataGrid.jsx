import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { formatDate, getScoreBand } from '../../../utils/formatAnalysis';

const DataGrid = ({ data }) => {
  const [sortField, setSortField] = useState('score');
  const [sortDirection, setSortDirection] = useState('desc');

  if (!data) return null;

  // Convert single analysis to array format for table
  const tableData = [{
    id: 1,
    title: data.title,
    score: data.meta?.score || 0,
    tone: data.meta?.tone || 'Unknown',
    verdict: data.meta?.verdict_short || 'Unknown',
    facts: data.facts?.length || 0,
    axioms: data.axioms?.length || 0,
    date: new Date()
  }];

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    }
    return sortDirection === 'asc' ?
      <ArrowUp className="w-3 h-3" /> :
      <ArrowDown className="w-3 h-3" />;
  };

  const getBadgeClass = (score) => {
    const band = getScoreBand(score);
    if (band === 'Neutral') return 'sci-badge-neutral';
    if (band === 'Leaning') return 'sci-badge-leaning';
    return 'sci-badge-propaganda';
  };

  return (
    <div className="overflow-x-auto">
      <table className="sci-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>
              <button
                onClick={() => handleSort('title')}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                Article Title
                {getSortIcon('title')}
              </button>
            </th>
            <th>
              <button
                onClick={() => handleSort('score')}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                Score
                {getSortIcon('score')}
              </button>
            </th>
            <th>Tone</th>
            <th>Verdict</th>
            <th>Facts</th>
            <th>Axioms</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row) => (
            <tr key={row.id}>
              <td className="sci-number">{row.id}</td>
              <td className="max-w-sm truncate font-medium">{row.title}</td>
              <td>
                <span className={`sci-badge ${getBadgeClass(row.score)}`}>
                  {row.score}
                </span>
              </td>
              <td className="text-gray-600">{row.tone}</td>
              <td className="font-medium">{row.verdict}</td>
              <td className="sci-number text-center">{row.facts}</td>
              <td className="sci-number text-center">{row.axioms}</td>
              <td className="text-gray-600 text-sm">{formatDate(row.date, 'short')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataGrid;
