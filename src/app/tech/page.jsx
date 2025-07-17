'use client';
import React from 'react';
import jsonData from './data.json';
import NewsList from '../components/NewsList';

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-100 flex flex-col">
      <main className="flex-1 w-full">
        <NewsList data={jsonData} />
      </main>
    </div>
  );
};

export default App;
