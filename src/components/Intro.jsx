import Reveal from './Reveal.jsx'
import { stats, nameTimeline } from '../data/content.js'

export default function Intro() {
  return (
    <section className="section" id="gioi-thieu">
      <Reveal className="sec-head">
        <p className="eyebrow">Giới thiệu</p>
        <h2>Mái nhà thiêng liêng cho nhiều thế hệ bạn trẻ</h2>
        <p className="lead">
          Ban Thanh Niên là một ban ngành của Hội Thánh Tin Lành Việt Nam – Chi Hội Sài Gòn, Hội
          Thánh được thành lập năm 1920 — một trong những Hội Thánh Tin Lành đầu tiên tại Sài Gòn.
        </p>
      </Reveal>
      <Reveal as="p" className="prose">
        Ban được hình thành từ những năm đầu khi Hội Thánh mới thành lập, và chính thức trở thành
        một ban ngành trong tổ chức của Hội Thánh vào khoảng <b>năm 1942–1944</b>, sau Đại Hội Đồng
        Tổng Liên Hội năm 1942. Ban quy tụ các bạn trẻ cùng nhau thờ phượng Chúa, học Lời Chúa, gây
        dựng đời sống thuộc linh, phục vụ qua âm nhạc và chung tay trong công tác truyền giảng, xã
        hội.
      </Reveal>

      <Reveal className="stats">
        {stats.map((s) => (
          <div className="stat" key={s.label}>
            <div className="num">{s.num}</div>
            <div className="lbl">{s.label}</div>
          </div>
        ))}
      </Reveal>

      <Reveal className="sec-head" style={{ marginBottom: 22 }}>
        <p className="eyebrow">Tên gọi qua các thời kỳ</p>
      </Reveal>
      <Reveal className="timeline">
        {nameTimeline.map((t) => (
          <div className={`t-item${t.current ? ' now' : ''}`} key={t.name}>
            <div className="t-era">{t.era}</div>
            <div className="t-name">{t.name}</div>
            <div className="t-note">{t.note}</div>
          </div>
        ))}
      </Reveal>
    </section>
  )
}
