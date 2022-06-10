import React from 'react'
import './Presentation.css'
import profile_image from '../images/profile-image.png'
import { Icon } from '@iconify/react';
import cv from '../Erick-cv.docx'

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
                <span> Front-End </span>
                <Icon className='icon_down' icon="clarity:angle-double-line" color="#545454" vFlip={true} />
            </div>
            <div className="web_designer">
                <strong> Web Designer </strong>
                <span> Figma </span>
                <Icon className='icon_down' icon="clarity:angle-double-line" color="#545454" vFlip={true} />
            </div>
            <div className="app_developer">
                <strong> App Developer </strong>
                <span> Flutter </span>
            </div>
            <a className='download' download="Erick CV" href={cv}>
                Download CV
            </a>
        </div>
    </main>
  )
}

export default Presentation