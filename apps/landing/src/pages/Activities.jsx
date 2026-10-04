import { useState } from "react";
import PageHero from "../components/PageHero.jsx";
import PhotoStrip from "../components/PhotoStrip.jsx";
import Schedule from "../components/Schedule.jsx";
import SubCommitteeModal from "../components/SubCommitteeModal.jsx";
import { iconFor } from "../lib/icons.js";
import { content } from "../lib/siteContent.js";

export default function Activities() {
  const [activeCommittee, setActiveCommittee] = useState(null);
  const { activities, subCommittees } = content;

  return (
    <>
      <PageHero title={activities.pageTitle} lead={activities.pageLead} />
      <main>
        <Schedule />

        <section className="section section-tight">
          <div className="wrap">
            <div className="committees glass sfx-rise">
              <h2>{activities.committeesTitle}</h2>
              <div className="chip-row">
                {subCommittees.map((c, i) => {
                  const Icon = iconFor(c.icon);
                  return (
                    <button
                      type="button"
                      className="chip"
                      key={i}
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

        <PhotoStrip title={activities.photoTitle} />
      </main>

      <SubCommitteeModal committee={activeCommittee} onClose={() => setActiveCommittee(null)} />
    </>
  );
}
