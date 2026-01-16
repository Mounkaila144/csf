import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerItem {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
  color: string;
  action?: 'scroll' | 'register-vendor' | 'whatsapp';
}

interface BannerProps {
  banners: BannerItem[];
  onRegisterVendor?: () => void;
}

const Banner: React.FC<BannerProps> = ({ banners, onRegisterVendor }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleBannerAction = (action?: string) => {
    switch (action) {
      case 'whatsapp':
        // Rediriger vers WhatsApp avec un message pré-rempli
        const message = encodeURIComponent('Bonjour, je souhaite obtenir un devis pour vos services de transport.');
        window.open(`https://wa.me/8615057804948?text=${message}`, '_blank');
        break;
      
      case 'register-vendor':
        // Ouvrir le modal d'inscription vendeur
        if (onRegisterVendor) {
          onRegisterVendor();
        }
        break;
      
      case 'scroll':
        // Scroll vers les produits
        const productsSection = document.querySelector('main');
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        break;
      
      default:
        // Action par défaut : scroll vers les produits
        const defaultSection = document.querySelector('main');
        if (defaultSection) {
          defaultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        break;
    }
  };

  return (
    <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden rounded-lg shadow-lg">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentSlide ? 'translate-x-0' : 
            index < currentSlide ? '-translate-x-full' : 'translate-x-full'
          }`}
        >
          <div
            className="w-full h-full bg-cover bg-center relative"
            style={{ backgroundImage: `url(${banner.image})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div className="text-white max-w-lg px-4">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg">
                  {banner.title}
                </h2>
                <p className="text-lg md:text-xl mb-6 drop-shadow-lg">
                  {banner.subtitle}
                </p>
                <button 
                  onClick={() => handleBannerAction(banner.action)}
                  className={`${
                    banner.color === 'gold' ? 'bg-custom-blue hover:bg-custom-blue-hover' : 'bg-custom-blue hover:bg-custom-blue-hover'
                  } text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:scale-105`}
                >
                  {banner.cta}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full transition-all shadow-lg"
      >
        <ChevronLeft size={24} />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full transition-all shadow-lg"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;