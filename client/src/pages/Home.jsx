import Hero from "../components/homepage/Hero";
import Features from "../components/homepage/Features";
import Volunteers from "../components/homepage/Volunteers";
import Testimonials from "../components/homepage/Testimonials";
import Process from "../components/homepage/Process";
import Contact from "../components/homepage/Contact";
import Footer from "../components/homepage/Footer";
import ScrollToTopButton from "../components/homepage/ScrollToTopButton";

const Home = () => {
  return (
    <>
      <Hero />
      <Features />
      <Volunteers />
      <Testimonials />
      <Process />
      <Contact />
      <Footer />
      <ScrollToTopButton />
    </>
  );
};

export default Home;
