import { useEffect, useState } from 'react';
import { PROFILE_ROLE_LABELS, type Profile, type ProfileRole } from '@btnsg/shared';
import { profileApi } from '../../api/resourceApi';
import { useAuth } from '../../auth/AuthContext';
import LoadingState from '../../ui/LoadingState';
import { formatDate } from '../../utils/format';

const AccountsScreen = () => {
  // 1. State
  const { profile: currentProfile, isDemo } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // 2. API calls
  const fetchProfiles = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      setProfiles(await profileApi.getList());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profile: Profile, patch: Partial<Profile>): Promise<void> => {
    try {
      setBusyId(profile.id);
      setError(null);
      await profileApi.update(profile.id, patch);
      await fetchProfiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyId(null);
    }
  };

  // 3. Effects
  useEffect(() => {
    fetchProfiles();
  }, []);

  // 4. Render
  if (isLoading) return <LoadingState />;

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Quản trị</span>
          <h2>Tài khoản &amp; phân quyền</h2>
          <p className="page-sub">
            Duyệt tài khoản mới đăng ký và phân quyền Quản trị / Ban Điều Hành.
          </p>
        </div>
      </div>

      {isDemo && (
        <div style={styles.demoNote}>
          Đang chạy chế độ demo (chưa cấu hình Supabase) — tài khoản bên dưới chỉ là dữ liệu mẫu.
          Khi deploy với Supabase, tài khoản đăng ký mới sẽ hiện ở đây để duyệt.
        </div>
      )}

      {error && <div className="form-error" style={{ marginBottom: 14 }}>{error}</div>}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Tạo lúc</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => {
              const isSelf = profile.id === currentProfile?.id;
              const isBusy = busyId === profile.id;
              return (
                <tr key={profile.id}>
                  <td data-label="Họ tên">
                    <span className="cell-strong">{profile.fullName}</span>
                    {isSelf && <span className="badge badge-grey" style={{ marginLeft: 6 }}>Bạn</span>}
                  </td>
                  <td data-label="Email" className="cell-muted">{profile.email}</td>
                  <td data-label="Vai trò">
                    <select
                      className="select"
                      value={profile.role}
                      disabled={isSelf || isBusy || isDemo}
                      onChange={(e) => updateProfile(profile, { role: e.target.value as ProfileRole })}
                    >
                      <option value="admin">{PROFILE_ROLE_LABELS.admin}</option>
                      <option value="bdh">{PROFILE_ROLE_LABELS.bdh}</option>
                    </select>
                  </td>
                  <td data-label="Trạng thái">
                    {profile.approved ? (
                      <span className="badge badge-green">Đã duyệt</span>
                    ) : (
                      <span className="badge badge-amber">Chờ duyệt</span>
                    )}
                  </td>
                  <td data-label="Tạo lúc" className="cell-muted">{formatDate(profile.createdAt)}</td>
                  <td>
                    <div className="cell-actions">
                      {!profile.approved ? (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={isBusy || isDemo}
                          onClick={() => updateProfile(profile, { approved: true })}
                        >
                          {isBusy ? 'Đang lưu…' : 'Duyệt'}
                        </button>
                      ) : (
                        !isSelf && (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            disabled={isBusy || isDemo}
                            onClick={() => updateProfile(profile, { approved: false })}
                          >
                            Thu hồi quyền
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={styles.note}>
        Tài khoản mới tự đăng ký sẽ ở trạng thái <strong>Chờ duyệt</strong> và không xem được dữ liệu
        cho đến khi Quản trị viên bấm Duyệt. Quản trị viên không thể tự đổi vai trò của chính mình.
      </div>
    </div>
  );
};

export default AccountsScreen;

const styles = {
  demoNote: {
    background: 'rgba(240, 193, 75, 0.16)',
    color: '#9a7415',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: '0.84rem',
    marginBottom: 16,
  },
  note: { marginTop: 14, fontSize: '0.8rem', color: 'var(--ink-3)', lineHeight: 1.6 },
};
