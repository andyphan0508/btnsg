import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import logoImg from '../../assets/logobtnsg.jpg';
import { useAuth } from '../../auth/AuthContext';

type Mode = 'signin' | 'signup';

const LoginScreen = () => {
  const { isAuthenticated, loading, isDemo, signIn, signUp } = useAuth();

  const [mode, setMode] = useState<Mode>('signin');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (loading) return null;
  if (isDemo || isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!email.trim() || !password) {
      setError('Vui lòng nhập email và mật khẩu.');
      return;
    }
    if (mode === 'signup' && !fullName.trim()) {
      setError('Vui lòng nhập họ tên.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        const message = await signIn(email.trim(), password);
        if (message) setError(message);
      } else {
        const message = await signUp(fullName.trim(), email.trim(), password);
        if (message) {
          setError(message);
        } else {
          setNotice('Đã tạo tài khoản. Tài khoản cần được Quản trị viên duyệt trước khi sử dụng.');
          setMode('signin');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <form className="card" style={styles.card} onSubmit={handleSubmit}>
        <div style={styles.brand}>
          <img src={logoImg} alt="Logo BTNSG" style={styles.logo} />
          <div>
            <div style={styles.brandName}>Ban Thanh Niên</div>
            <div style={styles.brandSub}>HTTL Sài Gòn — Dashboard nội bộ</div>
          </div>
        </div>

        <h2 style={styles.title}>{mode === 'signin' ? 'Đăng nhập' : 'Đăng ký tài khoản'}</h2>

        {mode === 'signup' && (
          <div className="field" style={styles.field}>
            <label className="field-label" htmlFor="login-fullname">Họ tên</label>
            <input
              id="login-fullname"
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
            />
          </div>
        )}

        <div className="field" style={styles.field}>
          <label className="field-label" htmlFor="login-email">Email</label>
          <input
            id="login-email"
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ban@example.com"
            autoComplete="username"
          />
        </div>

        <div className="field" style={styles.field}>
          <label className="field-label" htmlFor="login-password">Mật khẩu</label>
          <input
            id="login-password"
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          />
        </div>

        {error && <div className="form-error">{error}</div>}
        {notice && <div style={styles.notice}>{notice}</div>}

        <button className="btn btn-primary" type="submit" disabled={isSubmitting} style={styles.submit}>
          {isSubmitting ? 'Đang xử lý…' : mode === 'signin' ? 'Đăng nhập' : 'Đăng ký'}
        </button>

        <button
          className="btn btn-ghost btn-sm"
          type="button"
          style={styles.switchBtn}
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setError(null);
            setNotice(null);
          }}
        >
          {mode === 'signin' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
        </button>
      </form>
    </div>
  );
};

export default LoginScreen;

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--paper)',
    padding: 20,
  },
  card: { width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column' as const, gap: 12 },
  brand: { display: 'flex', alignItems: 'center', gap: 12 },
  logo: { width: 44, height: 44, borderRadius: 10, objectFit: 'cover' as const },
  brandName: { fontWeight: 800, color: 'var(--ink)' },
  brandSub: { fontSize: '0.78rem', color: 'var(--ink-3)' },
  title: { fontSize: '1.2rem', margin: '6px 0 2px' },
  field: { marginBottom: 2 },
  notice: {
    background: 'var(--green-soft)',
    color: 'var(--green)',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: '0.82rem',
  },
  submit: { marginTop: 6 },
  switchBtn: { alignSelf: 'center' as const },
};
