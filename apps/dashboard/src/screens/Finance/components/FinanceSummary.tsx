import type { Expense } from '@btnsg/shared';
import { formatMoney } from '../../../utils/format';

type FinanceSummaryProps = {
  expenses: Expense[];
};

const FinanceSummary = ({ expenses }: FinanceSummaryProps) => {
  const styles = createStyles();

  const totalIncome = expenses.filter((e) => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = expenses.filter((e) => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpense;

  const tiles = [
    { label: 'Tổng thu', value: formatMoney(totalIncome), color: 'var(--green)' },
    { label: 'Tổng chi', value: formatMoney(totalExpense), color: 'var(--red)' },
    { label: 'Số dư quỹ', value: formatMoney(balance), color: balance >= 0 ? 'var(--brand)' : 'var(--red)' },
  ];

  return (
    <div style={styles.grid}>
      {tiles.map((tile) => (
        <div className="card stat-tile card-hover" key={tile.label}>
          <div className="stat-tile-value" style={{ WebkitTextFillColor: 'initial', background: 'none', color: tile.color }}>
            {tile.value}
          </div>
          <div className="stat-tile-label">{tile.label}</div>
        </div>
      ))}
    </div>
  );
};

export default FinanceSummary;

const createStyles = () => {
  return {
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 16,
      marginBottom: 20,
    },
  };
};
