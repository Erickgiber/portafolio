import React from 'react';
import { FaNodeJs } from 'react-icons/fa';
import bootstrap from '../../../../assets/bootstrap.png';
import css3 from '../../../../assets/css3.png';
import figma from '../../../../assets/figma.png';
import html5 from '../../../../assets/html5.png';
import js from '../../../../assets/js.png';
import mysql from '../../../../assets/mysql.png';
import nodeJs from '../../../../assets/node.png';
import reactLogo from '../../../../assets/react.png';
import sass from '../../../../assets/sass.png';
import stylus from '../../../../assets/stylus.png';
import ts from '../../../../assets/ts.png';
import './Technologies.css';

const border = {
  border: '8px solid #ededed',
};

const objectFit = {
  objectFit: 'cover',
  border: '8px solid #ededed',
};

export function Technologies() {
  return (
    <main className="main-technologies-m">
      <div className="title_technologies">
        <FaNodeJs className="node_icon" />
        <h1> Technologies </h1>
      </div>

      <div className="languages">
        <a href="https://es.wikipedia.org/wiki/HTML5" target="_BLANK" rel="noreferrer">
          <img src={html5} alt="HTML 5" />
          <span> HTML 5 </span>
        </a>
        <a href="https://es.wikipedia.org/wiki/CSS" target="_BLANK" rel="noreferrer">
          <img src={css3} alt="CSS" />
          <span> CSS </span>
        </a>
        <a href="https://stylus-lang.com/" target="_BLANK" rel="noreferrer">
          <img style={objectFit} src={stylus} alt="Stylus" />
          <span> Stylus </span>
        </a>
        <a href="https://sass-lang.com/" target="_BLANK" rel="noreferrer">
          <img style={objectFit} src={sass} alt="Sass" />
          <span> Sass </span>
        </a>
        <a href="https://getbootstrap.com/" target="_BLANK" rel="noreferrer">
          <img style={objectFit} src={bootstrap} alt="Bootstrap" />
          <span> Bootstrap </span>
        </a>

        <a href="https://developer.mozilla.org/es/docs/Web/JavaScript" target="_BLANK" rel="noreferrer">
          <img style={border} src={js} alt="JavaScript" />
          <span> JavaScript </span>
        </a>

        <a href="https://es.wikipedia.org/wiki/TypeScript" target="_BLANK" rel="noreferrer">
          <img style={border} src={ts} alt="TypeScript" />
          <span> TypeScript </span>
        </a>

        <a href="https://es.reactjs.org/" target="_BLANK" rel="noreferrer">
          <img style={objectFit} src={reactLogo} alt="React JS" />
          <span> React JS </span>
        </a>
        <a href="https://nodejs.org/es/" target="_BLANK" rel="noreferrer">
          <img style={objectFit} src={nodeJs} alt="Node JS" />
          <span> Node JS </span>
        </a>
        <a href="https://www.mysql.com/" target="_BLANK" rel="noreferrer">
          <img style={objectFit} src={mysql} alt="MySQL" />
          <span> MySQL </span>
        </a>

        <a href="https://www.figma.com/" target="_BLANK" rel="noreferrer">
          <img style={objectFit} src={figma} alt="Figma" />
          <span> Figma </span>
        </a>
      </div>
    </main>
  );
}
