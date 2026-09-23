import { PiBooks, PiBuildings } from "react-icons/pi";
import PageHero from "../components/PageHero.jsx";
import PhotoStrip from "../components/PhotoStrip.jsx";
import Ministries from "../components/Ministries.jsx";
import MarqueeStrip from "../components/MarqueeStrip.jsx";
import { duties, partners } from "../data/content.js";

const DUTY_ICONS = { home: PiBuildings, books: PiBooks };

export default function Ministry() {
  return (
    <>
      <PageHero
        title="Chúng tôi phục vụ"
        lead="Bồi linh, truyền giảng, công tác xã hội, dã ngoại, huấn luyện — được gây dựng để đi ra."
      />
      <main>
        <Ministries />

        <section className="section section-tight">
          <div className="wrap">
            <header className="sec-head">
              <h2>
                Quản lý cơ sở &amp; <em>dịch vụ</em>
              </h2>
            </header>
            <div className="duty-grid">
              {duties.map((d, i) => {
                const Icon = DUTY_ICONS[d.icon];
                return (
                  <article className="duty-card glass sfx-rise" style={{ "--i": i }} key={d.title} data-sheen>
                    <span className="icon-tile">
                      <Icon />
                    </span>
                    <h3>{d.title}</h3>
                    <p>{d.desc}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section section-tight partners">
          <div className="wrap">
            <h2 className="partners-title">Đồng hành cùng các ban ngành Hội Thánh</h2>
          </div>
          <MarqueeStrip rows={[partners]} />
        </section>

        <PhotoStrip title="Dấu chân phục vụ" />
      </main>
    </>
  );
}
