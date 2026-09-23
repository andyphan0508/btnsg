import PageHero from "../components/PageHero.jsx";
import Contact from "../components/Contact.jsx";

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Liên hệ với chúng tôi"
        lead="Địa chỉ nhà thờ, bản đồ chỉ đường và các kênh liên lạc của Ban Thanh Niên."
      />
      <main>
        <Contact />
      </main>
    </>
  );
}
