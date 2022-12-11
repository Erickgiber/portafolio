import React from 'react'
import usa_flag from '../images/usa.png'
// import esp_flag from '../images/esp.png'
import './Header.css'
import { GrReactjs } from 'react-icons/gr'

const Header = () => {
  return (
    <header className='header-m'>
        <div className='react-icon-container'>
            <GrReactjs className='react-icon' />
        </div>
        <div className='language-btn'>
            <span> EN </span>
            <img src={usa_flag} alt="Spanish" />
        </div>
    </header>
  )
}

export default Header