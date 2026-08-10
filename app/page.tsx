import About from "./components/About";
import Contact from "./components/Contact";
import Executives from "./components/Executives";
import Faculties from "./components/Faculties";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import News from "./components/News";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <About />
        <Executives />
        <Faculties />
        <News />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
