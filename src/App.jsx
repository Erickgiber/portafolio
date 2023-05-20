import './App.css';
import { AboutMe } from './application/shared/ui/AboutMe';
import { BgAnimated } from './application/shared/ui/BgAnimated';
import { Footer } from './application/shared/ui/Footer';
import { Header } from './application/shared/ui/Header';
import { Preloader } from './application/shared/ui/Preloader';
import { Presentation } from './application/shared/ui/Presentation';
import { Proyects } from './application/shared/ui/Proyects';
import { Technologies } from './application/shared/ui/Technologies';

function App() {
  return (
    <>
      <Header />
      <Presentation />
      <AboutMe />
      <Technologies />
      <Proyects />
      <Footer />

      <Preloader />
      <BgAnimated />
    </>
  );
}

export default App;
