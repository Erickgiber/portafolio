import React from 'react';
import './Preloader.css';

export function Preloader() {
  return (
    <div className="preloader">
      <div className="lds-roller">
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
    </div>
  );
}

window.addEventListener('load', () => {
  document.body
    .style.overflow = 'auto';

  setTimeout(() => {
    document.querySelector('.preloader')
      .style.opacity = '0';
    setTimeout(() => {
      document.querySelector('.preloader')
        .style.display = 'none';
    }, 1000);
  }, 500);
});
