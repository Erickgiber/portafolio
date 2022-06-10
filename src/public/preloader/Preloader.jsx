import React from 'react'
import './Preloader.css'

const Preloader = () => {
  return (
    <div className="preloader">
        <div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
    </div>
  )
}

export default Preloader

window.addEventListener('load', ()=> {
    document.body
        .style.overflow = 'auto'
    
    setTimeout(()=> {
      document.querySelector('.preloader')
            .style.opacity = '0'
      setTimeout(()=> {
        document.querySelector('.preloader')
            .style.display = 'none'
      }, 1000)
    }, 500)
});