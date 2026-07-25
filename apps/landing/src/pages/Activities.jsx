import PageHero from "../components/PageHero.jsx";
import PhotoStrip from "../components/PhotoStrip.jsx";
import Schedule from "../components/Schedule.jsx";

export default function Activities() {
  return (
    <>
      <PageHero
        eyebrow="Cùng nhau mỗi tuần"
        title="Lịch sinh hoạt"
        lead="Nhóm thờ phượng chiều Chúa Nhật 14:30 — bạn có thể đến bất cứ lúc nào, luôn có người chào đón."
      />
      <main className="wrap page-view">
        <Schedule />
        <PhotoStrip title="Không khí các buổi nhóm" count={4} />
      </main>
    </>
  );
}
