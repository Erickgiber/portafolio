import logo from './logo.png'
import './App.css'
import Header from './public/header/Header'
import Presentation from './public/presentation/Presentation'
import About_me from './public/about_me/About_me'
import Technologies from './public/technologies/Technologies'
import Footer from './public/footer/Footer'
import Preloader from './public/preloader/Preloader'
import Proyects from './public/proyects/Proyects'

function App() {
  return (
    <div className="App">
      <Header />
      <Presentation />
      <About_me />
      <Technologies />
      <Proyects />
      <Footer />
      <Preloader />
      <ul class="circles">
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
            </ul>
    </div>
  )
}

export default App