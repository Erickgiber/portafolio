import { GrReactjs } from 'react-icons/gr';
import useaFlag from '../../../../assets/usa.png';
import './Header.css';

export function Header() {
  return (
    <header className="header-m">
      <div className="react-icon-container">
        <GrReactjs className="react-icon" />
      </div>
      <div className="language-btn">
        <span> EN </span>
        <img src={useaFlag} alt="Spanish" />
      </div>
    </header>
  );
}
