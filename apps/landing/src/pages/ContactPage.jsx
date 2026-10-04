import PageHero from "../components/PageHero.jsx";
import Contact from "../components/Contact.jsx";
import { content } from "../lib/siteContent.js";

export default function ContactPage() {
  const { contactPage } = content;

  return (
    <>
      <PageHero title={contactPage.pageTitle} lead={contactPage.pageLead} />
      <main>
        <Contact />
      </main>
    </>
  );
}
