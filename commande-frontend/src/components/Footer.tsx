import React from 'react';
import { Mail, Phone, MapPin, Truck, Shield, CreditCard, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/image/logo.png"
                alt="Commandes Sans Frontières"
                className="w-8 h-8 object-contain"
              />
              <div>
                <h3 className="font-bold text-lg">Commandes</h3>
                <p className="text-xs text-blue-400">Sans Frontières</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Plus de 5 ans d&apos;expérience en commerce international et transport.
              Nous nous occupons de vos produits, de l&apos;acquisition à l&apos;acheminement.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <a href="mailto:contact@commandesansfrontière.com" className="hover:text-blue-400 transition-colors">
                  contact@commandesansfrontière.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <a href="tel:+8615057804948" className="hover:text-blue-400 transition-colors">
                  +86 150 5780 4948
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Yiwu, Chine</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle size={16} />
                <a
                  href="https://wa.me/8615057804948"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-400 transition-colors flex items-center gap-1"
                >
                  <span>WhatsApp</span>
                  <span className="text-green-400">●</span>
                </a>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Nos Services</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Transport Maritime</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Transport Aérien</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Transport Routier</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sourcing Produits</a></li>
              <li><a href="https://wa.me/8615057804948" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">Assistance WhatsApp</a></li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Informations</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">À propos de CSF</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Programme Ambassadeur</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Notre Équipe</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Partenaires Chinois</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Opportunités d&apos;Affaires</a></li>
            </ul>
          </div>

          {/* Contact & Horaires */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact & Assistance</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MessageCircle className="text-green-400" size={16} />
                <span>Assistance 24/7</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="text-blue-400" size={16} />
                <span>Transactions sécurisées</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Truck className="text-blue-400" size={16} />
                <span>Suivi en temps réel</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="text-purple-400" size={16} />
                <span>Devis gratuit</span>
              </div>
              <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-300 mb-2">Disponible :</p>
                <p className="text-sm text-white font-medium">Lundi - Dimanche</p>
                <p className="text-sm text-gray-400">10:00 - 19:30 (Heure Chine)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment methods & bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Payment methods */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Paiements acceptés:</span>
              <div className="flex gap-3">
                <div className="bg-white text-gray-800 px-3 py-1 rounded text-xs font-medium">VISA</div>
                <div className="bg-white text-gray-800 px-3 py-1 rounded text-xs font-medium">Mastercard</div>
                <div className="bg-custom-blue text-white px-3 py-1 rounded text-xs font-medium">PayPal</div>
                <div className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium">Apple Pay</div>
                <div className="bg-purple-600 text-white px-3 py-1 rounded text-xs font-medium">Stripe</div>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-sm text-gray-400">
              © 2025 Commandes Sans Frontières. Tous droits réservés.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;