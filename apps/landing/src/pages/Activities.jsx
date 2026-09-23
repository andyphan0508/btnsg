import { useState } from "react";
import PageHero from "../components/PageHero.jsx";
import PhotoStrip from "../components/PhotoStrip.jsx";
import Schedule from "../components/Schedule.jsx";
import SubCommitteeModal, { COMMITTEE_ICONS } from "../components/SubCommitteeModal.jsx";
import { subCommittees } from "../data/content.js";

export default function Activities() {
  const [activeCommittee, setActiveCommittee] = useState(null);

  return (
    <>
      <PageHero
        title="Lịch sinh hoạt"
        lead="Nhóm thờ phượng chiều Chúa Nhật 14:30 — bạn có thể đến bất cứ lúc nào, luôn có người chào đón."
      />
      <main>
        <Schedule />

        <section className="section section-tight">
          <div className="wrap">
            <div className="committees glass sfx-rise">
              <h2>Các tiểu ban công tác</h2>
              <div className="chip-row">
                {subCommittees.map((c) => {
                  const Icon = COMMITTEE_ICONS[c.icon];
                  return (
                    <button
                      type="button"
                      className="chip"
                      key={c.id}
                      onClick={() => setActiveCommittee(c)}
                    >
                      <Icon aria-hidden="true" />
                      {c.title.replace(/^Tiểu ban:\s*/, "")}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <PhotoStrip title="Không khí các buổi nhóm" />
      </main>

      <SubCommitteeModal committee={activeCommittee} onClose={() => setActiveCommittee(null)} />
    </>
  );
}
