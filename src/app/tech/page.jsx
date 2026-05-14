'use client';
import React from 'react';
import jsonData from './data';
import PortalLayout from '../components/PortalLayout';

const App = () => {
  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <PortalLayout
        data={jsonData}
        title="科技与技术"
        subtitle="偏科技资讯与技术趋势，优先展示 GitHub all"
        categoryFilters={["科技", "技术"]}
        priorityFeeds={["github all"]}
      />
    </div>
  );
};

export default App;
