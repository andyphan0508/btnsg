import { useEffect, useState } from 'react';
import type { OverviewStats } from '@btnsg/shared';
import { statsApi } from '../../api/resourceApi';
import LoadingState from '../../ui/LoadingState';
import OverviewRecentSessions from './components/OverviewRecentSessions';
import OverviewSidePanel from './components/OverviewSidePanel';
import OverviewStatGrid from './components/OverviewStatGrid';

const OverviewScreen = () => {
  // 1. State declarations
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // 2. API call functions
  const fetchOverviewStats = async (): Promise<boolean> => {
    try {
      setIsLoadingStats(true);
      const data = await statsApi.getOverview();
      setOverviewStats(data);
      return true;
    } catch (error) {
      setStatsError(error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      setIsLoadingStats(false);
    }
  };

  // 3. Effects
  useEffect(() => {
    fetchOverviewStats();
  }, []);

  // 4. Render
  const styles = createStyles();

  if (isLoadingStats && !overviewStats) return <LoadingState />;
  if (statsError) return <div className="form-error">Không tải được thống kê: {statsError}</div>;
  if (!overviewStats) return null;

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Tổng quan</span>
          <h2>Tình hình Ban Thanh Niên</h2>
          <p className="page-sub">Bức tranh chung về thành viên, tham gia sinh hoạt, công việc và tài chính.</p>
        </div>
      </div>

      <OverviewStatGrid stats={overviewStats} />

      <div style={styles.mainGrid}>
        <OverviewRecentSessions sessions={overviewStats.recentSessions} />
        <OverviewSidePanel events={overviewStats.upcomingEvents} announcements={overviewStats.pinnedAnnouncements} />
      </div>
    </div>
  );
};

export default OverviewScreen;

const createStyles = () => {
  return {
    mainGrid: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
      gap: 18,
      alignItems: 'start' as const,
    },
  };
};
