import PageHero from "../components/PageHero.jsx";
import PhotoStrip from "../components/PhotoStrip.jsx";
import Ministries from "../components/Ministries.jsx";
import MarqueeStrip from "../components/MarqueeStrip.jsx";
import { iconFor } from "../lib/icons.js";
import { content } from "../lib/siteContent.js";
import { Rich } from "../lib/rich.jsx";

export default function Ministry() {
  const { ministryPage, duties } = content;

  return (
    <>
      <PageHero title={ministryPage.pageTitle} lead={ministryPage.pageLead} />
      <main>
        <Ministries />

        <section className="section section-tight">
          <div className="wrap">
            <header className="sec-head">
              <h2>
                <Rich text={ministryPage.dutiesTitle} />
              </h2>
            </header>
            <div className="duty-grid">
              {duties.map((d, i) => {
                const Icon = iconFor(d.icon);
                return (
                  <article className="duty-card glass sfx-rise" style={{ "--i": i }} key={i} data-sheen>
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
            <h2 className="partners-title">{ministryPage.partnersTitle}</h2>
          </div>
          <MarqueeStrip rows={[ministryPage.partners]} />
        </section>

        <PhotoStrip title={ministryPage.photoTitle} />
      </main>
    </>
  );
}
