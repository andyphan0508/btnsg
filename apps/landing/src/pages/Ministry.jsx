import PageHero from "../components/PageHero.jsx";
import PhotoStrip from "../components/PhotoStrip.jsx";
import Ministries from "../components/Ministries.jsx";

export default function Ministry() {
  return (
    <>
      <PageHero
        eyebrow="Đời sống phục vụ"
        title="Chúng tôi phục vụ"
        lead="Bồi linh, truyền giảng, công tác xã hội, dã ngoại, huấn luyện — được gây dựng để đi ra."
      />
      <main className="wrap page-view">
        <Ministries />
        <PhotoStrip title="Dấu chân phục vụ" count={4} />
      </main>
    </>
  );
}
