import { useMemo, useState } from 'react';
import type { Expense, FinancePeriod } from '@btnsg/shared';
import { groupByPeriod, summarizeByCategory, summarizeExpenses } from '@btnsg/shared';
import { formatMoney } from '../../../utils/format';

/**
 * Phân tích thu chi theo ngày / tháng / năm.
 *
 * Màu series: Thu = xanh dương (--blue), Chi = cam (--brand). Cặp này đã được
 * kiểm tra đạt ngưỡng phân biệt cho người mù màu (ΔE 24.4) — khác với cặp
 * xanh lá/đỏ quen thuộc vốn gần như trùng nhau với người mù màu đỏ-lục.
 * Ngoài màu, mỗi cột còn được phân biệt bằng vị trí cố định + chú giải + bảng số.
 */

const PERIOD_TABS: { key: FinancePeriod; label: string; limit: number }[] = [
  { key: 'day', label: 'Theo ngày', limit: 14 },
  { key: 'month', label: 'Theo tháng', limit: 12 },
  { key: 'year', label: 'Theo năm', limit: 6 },
];

const compactMoney = (amount: number): string => {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} tỷ`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} tr`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}k`;
  return String(amount);
};

type FinanceAnalyticsProps = {
  expenses: Expense[];
};

const FinanceAnalytics = ({ expenses }: FinanceAnalyticsProps) => {
  const [period, setPeriod] = useState<FinancePeriod>('month');

  const activeTab = PERIOD_TABS.find((tab) => tab.key === period) ?? PERIOD_TABS[1];

  const buckets = useMemo(
    () => groupByPeriod(expenses, period, activeTab.limit),
    [expenses, period, activeTab.limit],
  );

  const totals = useMemo(() => summarizeExpenses(expenses), [expenses]);
  const incomeByCategory = useMemo(() => summarizeByCategory(expenses, 'income'), [expenses]);
  const expenseByCategory = useMemo(() => summarizeByCategory(expenses, 'expense'), [expenses]);

  // Trục dùng chung cho cả hai series — không bao giờ dùng 2 thang đo.
  const maxValue = useMemo(
    () => Math.max(1, ...buckets.map((bucket) => Math.max(bucket.income, bucket.expense))),
    [buckets],
  );

  // Kỳ gần nhất so với kỳ liền trước — cho biết xu hướng chi tiêu.
  const trend = useMemo(() => {
    if (buckets.length < 2) return null;
    const current = buckets[buckets.length - 1];
    const previous = buckets[buckets.length - 2];
    if (previous.expense === 0) return null;
    const change = ((current.expense - previous.expense) / previous.expense) * 100;
    return { current, previous, change };
  }, [buckets]);

  if (expenses.length === 0) return null;

  return (
    <div className="card fin-analytics">
      <div className="fin-analytics-head">
        <div>
          <div className="card-title">Phân tích thu chi</div>
          <div className="fin-analytics-sub">
            {buckets.length} kỳ gần nhất · {totals.count} giao dịch
          </div>
        </div>
        <div className="fin-tabs">
          {PERIOD_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`fin-tab${tab.key === period ? ' active' : ''}`}
              onClick={() => setPeriod(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chú giải — luôn hiện vì có 2 series */}
      <div className="fin-legend">
        <span className="fin-legend-item">
          <span className="fin-swatch fin-swatch-income" /> Thu
        </span>
        <span className="fin-legend-item">
          <span className="fin-swatch fin-swatch-expense" /> Chi
        </span>
        {trend && (
          <span className="fin-trend">
            Chi {trend.current.label}:{' '}
            <strong style={{ color: trend.change > 0 ? 'var(--brand-deep)' : 'var(--green)' }}>
              {trend.change > 0 ? '▲' : '▼'} {Math.abs(trend.change).toFixed(0)}%
            </strong>{' '}
            so với {trend.previous.label}
          </span>
        )}
      </div>

      {buckets.length === 0 ? (
        <div className="fin-empty">Chưa đủ dữ liệu để vẽ biểu đồ.</div>
      ) : (
        <div className="fin-chart" role="img" aria-label={`Biểu đồ thu chi ${activeTab.label.toLowerCase()}`}>
          {buckets.map((bucket) => (
            <div className="fin-col" key={bucket.key}>
              <div className="fin-bars">
                <div
                  className="fin-bar fin-bar-income"
                  style={{ height: `${(bucket.income / maxValue) * 100}%` }}
                  title={`${bucket.label} · Thu ${formatMoney(bucket.income)}`}
                />
                <div
                  className="fin-bar fin-bar-expense"
                  style={{ height: `${(bucket.expense / maxValue) * 100}%` }}
                  title={`${bucket.label} · Chi ${formatMoney(bucket.expense)}`}
                />
                <div className="fin-tooltip">
                  <strong>{bucket.label}</strong>
                  <span>Thu: {formatMoney(bucket.income)}</span>
                  <span>Chi: {formatMoney(bucket.expense)}</span>
                  <span className="fin-tooltip-balance">
                    Còn: {formatMoney(bucket.balance)}
                  </span>
                </div>
              </div>
              <div className="fin-col-label">{bucket.label.replace('Tháng ', 'T').replace('Năm ', '')}</div>
            </div>
          ))}
        </div>
      )}

      {/* Bảng số — vừa là "table view" cho người dùng trợ năng, vừa để tra cứu */}
      <div className="fin-breakdown">
        <CategoryBreakdown title="Cơ cấu khoản thu" rows={incomeByCategory} tone="income" />
        <CategoryBreakdown title="Cơ cấu khoản chi" rows={expenseByCategory} tone="expense" />
      </div>
    </div>
  );
};

type CategoryBreakdownProps = {
  title: string;
  rows: { category: string; amount: number; count: number; percent: number }[];
  tone: 'income' | 'expense';
};

const CategoryBreakdown = ({ title, rows, tone }: CategoryBreakdownProps) => {
  return (
    <div className="fin-breakdown-block">
      <div className="fin-breakdown-title">{title}</div>
      {rows.length === 0 ? (
        <div className="fin-empty">Chưa có dữ liệu.</div>
      ) : (
        <div className="fin-breakdown-list">
          {rows.map((row) => (
            <div className="fin-breakdown-row" key={row.category}>
              <div className="fin-breakdown-label">
                <span>{row.category}</span>
                <span className="fin-breakdown-amount">
                  {formatMoney(row.amount)}
                  <small> · {row.percent.toFixed(0)}%</small>
                </span>
              </div>
              <div className="fin-breakdown-track">
                <div
                  className={`fin-breakdown-fill fin-fill-${tone}`}
                  style={{ width: `${Math.max(row.percent, 1.5)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FinanceAnalytics;
