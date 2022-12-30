import "./Proyects.css"
import github from "../images/github.png"

const Proyects = () => {
  return (
    <div className="main-proyects">
        <h2> You can see mine projects in Github </h2>
        <div className="github">
          <a target="_blank" href="https://github.com/Erickgiber" className="link">
            <img src={github} alt="Github" />
            <span> Github </span>
          </a>
        </div>
    </div>
  )
}

export default Proyects