import React from 'react';
import axios from 'axios';
// TableHeader Component
export function TableHeader() {
  return (
    <thead className='text-center items-center border-b border-neutral-400'>
      <tr>
        <th scope="col" className="pt-2 py-3 text-xs font-bold text-gray-800 tracking-wider">
          Title
        </th>
        <th scope="col" className="pt-2 py-3 text-xs font-bold text-gray-800 tracking-wider w-1/5">
          Tags
        </th>
        <th scope="col" className="pt-2 py-3 text-xs font-bold text-gray-800 tracking-wider">
          Expenses/Earnings
        </th>
        <th scope="col" className="pt-2 py-3 text-xs font-bold text-gray-800 tracking-wider">
          Date
        </th>
      </tr>
    </thead>
  );
}

// TableRow Component
// Usage: <TableRow title="Chipotle" tagName="food" savings="$724.47" date="09/19/2024" />
export function TableRow({ title, tagName, amount, date, type, isDeleteOn, onDelete }) {

  
  return (
    <tr className='text-center divide-x divide-neutral-400'>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
        {title}
      </td>
      <td className="px-6 py-4 whitespace-nowrap flex justify-center text-sm text-gray-800 ">
        <TableTag tagName={tagName} />
      </td>
      <td className={`px-6 py-4 whitespace-nowrap text-sm ${type === 'Expense' ? 'text-red-500' : 'text-emerald-600'}`}>
        {amount}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
        {date}
      </td>
      {isDeleteOn && (
        <td className='whitespace-nowrap text-sm text-gray-800 px-2'>
          <button onClick={onDelete} className="bg-neutral-100 text-red-500 hover:text-red-700 hover:border-neutral-500">
            X
          </button>
        </td>
      )}
    </tr>
  );
}

// TableTag Component
// Usage: <TableTag tagName="food" />
export function TableTag({ tagName }) {
    let color = '';
    const tag = tagName.toUpperCase();
    switch (tag) {
      case 'FOOD':
          color = 'bg-cyan-400';
          break;
      case 'RENT':
          color = 'bg-amber-500';
          break;
      case 'UTILITIES':
          color = 'bg-teal-400';
          break;
      case 'TRANSPORTATION':
          color = 'bg-blue-400';
          break;
      case 'HEALTHCARE':
          color = 'bg-red-400';
          break;
      case 'LEISURE':
          color = 'bg-purple-400';
          break;
      case 'EARNINGS':
      case 'PAYCHECK':
          color = 'bg-green-600';
          break;
      default:
          color = 'bg-gray-400';
  }  

    return (
      <div className={`text-center py-0.5 px-3 w-full object-contain flex-shrink-0 text-black ${color} truncate`}>
      {tag}
      </div>
    );
}