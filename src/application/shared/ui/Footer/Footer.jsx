import React from 'react';
import './Footer.css';
import {
  BsLinkedin, BsWhatsapp, BsInstagram, BsTwitter, BsInfoCircle,
} from 'react-icons/bs';
import { SiMinutemailer } from 'react-icons/si';
import { MdEmail } from 'react-icons/md';
import { FaCity } from 'react-icons/fa';
import { GiEarthAmerica } from 'react-icons/gi';
import { FiAtSign } from 'react-icons/fi';
import { RiContactsBookLine } from 'react-icons/ri';

export function Footer() {
  return (
    <footer className="footer-m">
      <div className="left">
        <h2>
          {' '}
          <RiContactsBookLine />
          {' '}
          Contacts
          {' '}
        </h2>
        <a href="https://wa.link/wo1hx3" target="_BLANK" rel="noreferrer">
          {' '}
          <BsWhatsapp />
          {' '}
          Whastapp
          {' '}
        </a>
        <a href="https://www.linkedin.com/in/erickgiber/" target="_BLANK" rel="noreferrer">
          {' '}
          <BsLinkedin />
          {' '}
          Linkedin
          {' '}
        </a>
        <a href="https://www.instagram.com/erickgiber/" target="_BLANK" rel="noreferrer">
          {' '}
          <BsInstagram />
          {' '}
          Instagram
          {' '}
        </a>
        <a href="https://twitter.com/Erickgiber" target="_BLANK" rel="noreferrer">
          {' '}
          <BsTwitter />
          {' '}
          Twitter
          {' '}
        </a>
      </div>
      <div className="right">
        <h2>
          {' '}
          <BsInfoCircle />
          {' '}
          Information
          {' '}
        </h2>

        <ul className="ul_right">
          <li>
            {' '}
            <SiMinutemailer />
            {' '}
            Telephone: +58 412-020-4257
            {' '}
          </li>
          <li>
            {' '}
            <MdEmail />
            {' '}
            Email: erickgiber7@gmail.com
            {' '}
          </li>
          <li>
            {' '}
            <GiEarthAmerica />
            {' '}
            Country: Venezuela
            {' '}
          </li>
          <li>
            {' '}
            <FaCity />
            {' '}
            City: Carupano
            {' '}
          </li>
          <li>
            {' '}
            <FiAtSign />
            {' '}
            Alias: Erickgiber
            {' '}
          </li>
        </ul>
      </div>
    </footer>
  );
}
