import React from 'react'
import { AiOutlineUser } from 'react-icons/ai'
import './About_me.css'
import react_icon from '../../logo.png'

const About_me = () => {
  return (
    <main className='main-about-me-m'>
        <div className="title_about_me">
            <AiOutlineUser className='user_icon' />
            <h1> About me </h1>
        </div>
        <div className="sentence_1 s_all">
            <span>
                I’m from Venezuela, I’m 18 years old,
                I love programming, always willing to learn
                more and more.
            </span>
            <img src={react_icon} alt="React Image" />
        </div>
        <div className="setence_2 s_all">
            <span>
                I really like European football, drawing,
                listening to music and above all creating.
            </span>
        </div>
        <div className="sentence_3 s_all">
            <span>
                3 years of experience in web development, and
                I have a lot of versatility when it comes to
                doing my job.
            </span>
        </div>
    </main>
  )
}

export default About_me