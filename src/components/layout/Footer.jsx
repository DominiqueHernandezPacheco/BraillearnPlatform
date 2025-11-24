import React from 'react';
import { Facebook, Twitter, Instagram } from '../common/Icons';

const Footer = () => (
  <footer className="bg-blue-600 text-blue-100 py-16">
    <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
      <div>
        <h4 className="text-2xl font-bold text-white mb-4">Braillearn</h4>
        <p className="mb-4">Follow us</p>
        <div className="flex space-x-4">
          <a href="#" aria-label="Síguenos en Facebook" className="hover:text-white"><Facebook className="w-6 h-6" /></a>
          <a href="#" aria-label="Síguenos en Twitter" className="hover:text-white"><Twitter className="w-6 h-6" /></a>
          <a href="#" aria-label="Síguenos en Instagram" className="hover:text-white"><Instagram className="w-6 h-6" /></a>
        </div>
      </div>
      <div>
        <h5 className="font-semibold text-white mb-4">Useful Links</h5>
        <ul className="space-y-2">
          <li><a href="#" className="hover:text-white">Obtener Ayuda</a></li>
          <li><a href="#" className="hover:text-white">Preguntas Frecuentes</a></li>
        </ul>
      </div>
      <div>
        <h5 className="font-semibold text-white mb-4">Contactos</h5>
        <p className="mb-2">Email: info@braillearn.com</p>
        <p>Universidad Autónoma de Campeche</p>
      </div>
    </div>
    <div className="text-center text-blue-200 mt-10 pt-6 border-t border-blue-500">
      All Copyrights reserved. (c) Un proyecto para Infomatrix 2025.
    </div>
  </footer>
);

export default Footer;