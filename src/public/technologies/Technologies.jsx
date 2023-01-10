import React from 'react'
import { FaNodeJs } from 'react-icons/fa'
import './Technologies.css'
import html5 from '../images/html5.png'
import css3 from '../images/css3.png'
import js from '../images/js.png'
import ts from '../images/ts.png'
import stylus from '../images/stylus.png'
import react_logo from '../images/react.png'
import node_js from '../images/node.png'
import sass from '../images/sass.png'
import bootstrap from '../images/bootstrap.png'
import figma from '../images/figma.png'
import mysql from '../images/mysql.png'

const border = {
  border: '8px solid #ededed'
}

const object_fit = {
  objectFit: 'cover',
  border: '8px solid #ededed'
}


const Technologies = () => {
  return (
    <main className='main-technologies-m'>
        <div className="title_technologies">
          <FaNodeJs className='node_icon' />
          <h1> Technologies </h1>
        </div>
          
          <div className="languages">
            <a href='https://es.wikipedia.org/wiki/HTML5' target="_BLANK">
              <img src={html5} alt="HTML 5" />
              <span> HTML 5 </span>
            </a>
            <a href='https://es.wikipedia.org/wiki/CSS' target="_BLANK">
              <img src={css3} alt="CSS" />
              <span> CSS </span>
            </a>
            <a href='https://stylus-lang.com/' target="_BLANK">
              <img style={object_fit} src={stylus} alt="Stylus" />
              <span> Stylus </span>
            </a>
            <a href='https://sass-lang.com/' target="_BLANK">
              <img style={object_fit} src={sass} alt="Sass" />
              <span> Sass </span>
            </a>
            <a href='https://getbootstrap.com/' target="_BLANK">
              <img style={object_fit} src={bootstrap} alt="Bootstrap" />
              <span> Bootstrap </span>
            </a>

            <a href='https://developer.mozilla.org/es/docs/Web/JavaScript' target="_BLANK">
              <img style={border} src={js} alt="JavaScript" />
              <span> JavaScript </span>
            </a>

            <a href='https://es.wikipedia.org/wiki/TypeScript' target="_BLANK">
              <img style={border} src={ts} alt="TypeScript" />
              <span> TypeScript </span>
            </a>

            <a href='https://es.reactjs.org/' target="_BLANK">
              <img style={object_fit} src={react_logo} alt="React JS" />
              <span> React JS </span>
            </a>
            <a href='https://nodejs.org/es/' target="_BLANK">
              <img style={object_fit} src={node_js} alt="Node JS" />
              <span> Node JS </span>
            </a>
            <a href='https://www.mysql.com/' target="_BLANK">
              <img style={object_fit} src={mysql} alt="MySQL" />
              <span> MySQL </span>
            </a>

            <a href='https://www.figma.com/' target="_BLANK">
              <img style={object_fit} src={figma} alt="Figma" />
              <span> Figma </span>
            </a>
          </div>
    </main>
  )
}

export default Technologies