import Reveal from './Reveal.jsx'
import { ministries, duties, partners } from '../data/content.js'

export default function Ministries() {
  return (
    <section className="section" id="muc-vu">
      <Reveal className="sec-head">
        <p className="eyebrow">Mục vụ &amp; hoạt động thường niên</p>
        <h2>Được gây dựng để đi ra phục vụ</h2>
      </Reveal>
      <Reveal className="grid3">
        {ministries.map((m) => (
          <div className="m-card" key={m.title}>
            <div className="m-kind">{m.kind}</div>
            <h3>{m.title}</h3>
            <p>{m.desc}</p>
          </div>
        ))}
      </Reveal>

      <Reveal className="duty">
        {duties.map((d) => (
          <div key={d.title}>
            <h3>{d.title}</h3>
            <p>{d.desc}</p>
          </div>
        ))}
      </Reveal>

      <Reveal style={{ marginTop: 26 }}>
        <p className="eyebrow" style={{ marginBottom: 4 }}>
          Cộng tác phục vụ cùng các ban ngành
        </p>
        <div className="chips">
          {partners.map((p) => (
            <span className="chip" key={p}>
              {p}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
