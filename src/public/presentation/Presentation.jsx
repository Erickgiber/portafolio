import React from 'react'
import './Presentation.css'
import profile_image from '../images/profile-image.jpg'
import { Icon } from '@iconify/react'
import cv from '../Erick-CV.pdf'

const Presentation = () => {
  return (
    <main className='main-m'>
        <div className="title">
            <h1> Hello I'm </h1>
            <strong> Erick Ramírez </strong>
        </div>
        <div className="profile-image">
            <img src={profile_image} alt="Erick Image" />
        </div>
        <div className="habilities_1">
            <div className="web_developer">
                <strong> Web Developer </strong>
                <span> Full Stack </span>
                <Icon className='icon_down' icon="clarity:angle-double-line" color="#545454" vFlip={true} />
            </div>
            <div className="web_designer">
                <strong> Web Designer </strong>
                <span> Figma </span>
                <Icon className='icon_down' icon="clarity:angle-double-line" color="#545454" vFlip={true} />
            </div>
            
            <a className='download' download href={cv}>
                Download CV
            </a>
        </div>
    </main>
  )
}

export default Presentation

/*
    <div className="app_developer">
        <strong> App Developer </strong>
        <span> Flutter </span>
    </div>
*/

window.addEventListener('load', ()=> {
    setTimeout(()=> {
        document.querySelector('.profile-image')
        .style.cssText = `
            opacity: 1;
            transform: none;
        `
    }, 800)  
})