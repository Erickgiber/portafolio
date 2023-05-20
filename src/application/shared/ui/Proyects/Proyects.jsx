import './Proyects.css';
import github from '../../../../assets/github.png';

export function Proyects() {
  return (
    <div className="main-proyects">
      <h2> You can see mine projects in Github </h2>
      <div className="github">
        <a target="_blank" href="https://github.com/Erickgiber" className="link" rel="noreferrer">
          <img src={github} alt="Github" />
          <span> Github </span>
        </a>
      </div>
    </div>
  );
}
