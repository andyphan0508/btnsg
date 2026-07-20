import { Router } from 'express';
import type { OverviewStats } from '@btnsg/shared';
import {
  announcementsCol,
  attendanceCol,
  expensesCol,
  membersCol,
  requestsCol,
  scheduleCol,
  tasksCol,
} from '../store/collections.js';

const RECENT_SESSION_LIMIT = 8;

const computeOverviewStats = (): OverviewStats => {
  const members = membersCol.list();
  const sessions = attendanceCol.list().sort((a, b) => b.date.localeCompare(a.date));
  const tasks = tasksCol.list();
  const expenses = expensesCol.list();

  const recentSessions = sessions.slice(0, RECENT_SESSION_LIMIT).map((session) => ({
    id: session.id,
    date: session.date,
    title: session.title,
    presentCount: session.records.filter((r) => r.status === 'present').length,
    totalCount: session.records.length,
  }));

  const attendanceTotals = recentSessions.reduce(
    (acc, s) => ({ present: acc.present + s.presentCount, total: acc.total + s.totalCount }),
    { present: 0, total: 0 },
  );

  const totalIncome = expenses.filter((e) => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = expenses.filter((e) => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);

  return {
    totalMembers: members.length,
    activeMembers: members.filter((m) => m.status === 'active').length,
    leaderCount: members.filter((m) => m.role === 'leader').length,
    attendanceRate: attendanceTotals.total > 0 ? Math.round((attendanceTotals.present / attendanceTotals.total) * 100) : 0,
    recentSessions,
    openTasks: tasks.filter((t) => t.status !== 'done').length,
    doneTasks: tasks.filter((t) => t.status === 'done').length,
    openRequests: requestsCol.list().filter((r) => r.status === 'open' || r.status === 'in_review').length,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    upcomingEvents: scheduleCol.list().sort((a, b) => (a.dayOfWeek ?? 0) - (b.dayOfWeek ?? 0)),
    pinnedAnnouncements: announcementsCol
      .list()
      .filter((a) => a.pinned)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
};

export const statsRouter = Router();

statsRouter.get('/overview', (_req, res) => {
  res.json({ data: computeOverviewStats() });
});
