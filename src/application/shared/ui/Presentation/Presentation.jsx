import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import cv from '../../../../assets/Erick-CV.pdf';
import profileImage from '../../../../assets/profile-image.png';
import './Presentation.css';

const photoStyle = {
  opacity: 1,
  transform: 'none',
};

export function Presentation() {
  const [photoAnimation, setPhotoAnimation] = useState({});

  useEffect(() => {
    setPhotoAnimation(photoStyle);
  }, []);

  return (
    <main className="main-m">
      <div className="title">
        <h1> Hello Im </h1>
        <strong> Erick Ramírez </strong>
      </div>
      <div className="profile-image" style={photoAnimation}>
        <img src={profileImage} alt="Erick" />
      </div>
      <div className="habilities_1">
        <div className="web_developer">
          <strong> Web Developer </strong>
          <span> Full Stack </span>
          <Icon className="icon_down" icon="clarity:angle-double-line" color="#545454" vFlip />
        </div>
        <div className="web_designer">
          <strong> Web Designer </strong>
          <span> Figma </span>
          <Icon className="icon_down" icon="clarity:angle-double-line" color="#545454" vFlip />
        </div>

        <a className="download" download href={cv}>
          Download CV
        </a>
      </div>
    </main>
  );
}
