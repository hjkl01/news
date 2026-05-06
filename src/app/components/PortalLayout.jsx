import React from 'react';
import NewsList from './NewsList';
import PortalWidgets from './PortalWidgets';

const toTimestamp = (value) => {
  if (!value) return 0;
  const ts = new Date(value).getTime();
  return Number.isNaN(ts) ? 0 : ts;
};

const sortByLatest = (list, priorityFeeds = []) => {
  const normalizedPriority = priorityFeeds.map((item) => String(item).toLowerCase());

  const getPriorityRank = (feedName) => {
    const normalizedFeed = String(feedName || '').toLowerCase();
    const idx = normalizedPriority.findIndex((keyword) => normalizedFeed.includes(keyword));
    return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
  };

  return [...list].sort((a, b) => {
    const rankA = getPriorityRank(a.feed_name);
    const rankB = getPriorityRank(b.feed_name);

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    return toTimestamp(b.pub_date) - toTimestamp(a.pub_date);
  });
};

const PortalLayout = ({
  data = [],
  title = '最新资讯',
  subtitle = '按来源分组，优先展示最近更新',
  priorityFeeds = [],
  categoryFilter = '',
  categoryFilters = []
}) => {
  const normalizedFilters = Array.isArray(categoryFilters)
    ? categoryFilters.map((item) => String(item))
    : [];

  const filteredByCategory = normalizedFilters.length > 0
    ? (data || []).filter((item) => normalizedFilters.includes(String(item.category || '')))
    : categoryFilter
      ? (data || []).filter((item) => String(item.category || '') === categoryFilter)
      : (data || []);

  const latestData = sortByLatest(filteredByCategory, priorityFeeds);
  const hotData = latestData.slice(0, 36);

  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-12">
      <aside className="order-2 md:order-2 lg:order-1 lg:col-span-3" data-region="left">
        <NewsList data={hotData} mode="hot" title="热点快览" />
      </aside>

      <section className="order-1 md:order-1 lg:order-2 lg:col-span-6" data-region="center">
        <NewsList
          data={latestData}
          mode="main"
          title={title}
          subtitle={subtitle}
          priorityFeeds={priorityFeeds}
        />
      </section>

      <aside className="order-3 md:order-3 lg:order-3 lg:col-span-3" data-region="right">
        <PortalWidgets data={latestData} />
      </aside>
    </section>
  );
};

export default PortalLayout;
