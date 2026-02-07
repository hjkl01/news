'use client';
import React from 'react';
import jsonData from './data.json';
import NewsCloud from './components/NewsCloud';

const App = () => {
  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <main className="flex-1 w-full">
        <NewsCloud data={jsonData} />
      </main>
    </div>
  );
};

export default App;
