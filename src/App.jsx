import logo from './logo.png'
import './App.css'
import Header from './public/header/Header'
import Presentation from './public/presentation/Presentation'
import About_me from './public/about_me/About_me'
import Technologies from './public/technologies/Technologies'
import Footer from './public/footer/Footer'

function App() {
  return (
    <div className="App">
      <Header />
      <Presentation />
      <About_me />
      <Technologies />
      <Footer />
    </div>
  )
}

export default App