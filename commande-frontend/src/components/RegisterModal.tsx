import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, UserCheck, Users, Store, FileText, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Modal } from './Modal';
import { authService } from '../services/authService';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  defaultRole?: 'client' | 'vendor';
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
  defaultRole = 'client'
}) => {
  const { register, error, isLoading, clearError } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: defaultRole,
    shop_name: '',
    shop_description: '',
    phone: '',
    address: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Mettre à jour le role quand defaultRole change
  useEffect(() => {
    setFormData(prev => ({ ...prev, role: defaultRole }));
  }, [defaultRole]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: [] }));
    }
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string[]> = {};

    if (!formData.name.trim()) {
      newErrors.name = ['Le nom est obligatoire'];
    }

    if (!formData.email.trim()) {
      newErrors.email = ['L\'email est obligatoire'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = ['Format d\'email invalide'];
    }

    if (!formData.password) {
      newErrors.password = ['Le mot de passe est obligatoire'];
    } else if (formData.password.length < 6) {
      newErrors.password = ['Le mot de passe doit contenir au moins 6 caractères'];
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = ['La confirmation du mot de passe est obligatoire'];
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = ['Les mots de passe ne correspondent pas'];
    }

    // Validation supplémentaire pour les vendeurs
    if (formData.role === 'vendor') {
      if (!formData.shop_name.trim()) {
        newErrors.shop_name = ['Le nom de la boutique est obligatoire'];
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await register(formData);
      onClose();

      // Rediriger selon le rôle de l'utilisateur
      const u = authService.getUser();
      if (u?.role === 'vendor') {
        router.replace('/vendor/dashboard');
      }

      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'client',
        shop_name: '',
        shop_description: '',
        phone: '',
        address: ''
      });
      setErrors({});
    } catch (error) {
      // Handle API validation errors
      if (error instanceof Error && error.message.includes('errors')) {
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.errors) {
            setErrors(errorData.errors);
          }
        } catch {
          // Error parsing failed, use general error
        }
      }
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: 'client',
      shop_name: '',
      shop_description: '',
      phone: '',
      address: ''
    });
    setErrors({});
    clearError();
  };

  const handleSwitchToLogin = () => {
    handleClose();
    onSwitchToLogin();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Créer un compte</h2>
          <p className="text-gray-600">
            Rejoignez-nous et découvrez nos produits
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border ${
                  errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
                placeholder="Votre nom complet"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border ${
                  errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
                placeholder="votre@email.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
            )}
          </div>

          {/* Role Field */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Type de compte
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border ${
                  errors.role ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-lg focus:outline-none focus:ring-2 transition-colors appearance-none bg-white`}
              >
                <option value="client">Client - Acheter des produits</option>
                <option value="vendor">Vendeur - Vendre des produits</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role[0]}</p>
            )}
            {formData.role === 'vendor' && (
              <p className="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                ℹ️ Votre compte vendeur devra être validé par un administrateur avant de pouvoir vendre.
              </p>
            )}
          </div>

          {/* Vendor specific fields */}
          {formData.role === 'vendor' && (
            <>
              {/* Shop Name Field */}
              <div>
                <label htmlFor="shop_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la boutique <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Store className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="shop_name"
                    name="shop_name"
                    type="text"
                    value={formData.shop_name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border ${
                      errors.shop_name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
                    placeholder="Ma Boutique"
                  />
                </div>
                {errors.shop_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.shop_name[0]}</p>
                )}
              </div>

              {/* Shop Description Field */}
              <div>
                <label htmlFor="shop_description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description de la boutique
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    id="shop_description"
                    name="shop_description"
                    rows={3}
                    value={formData.shop_description}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border ${
                      errors.shop_description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors resize-none`}
                    placeholder="Décrivez votre boutique..."
                  />
                </div>
                {errors.shop_description && (
                  <p className="mt-1 text-sm text-red-600">{errors.shop_description[0]}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border ${
                        errors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone[0]}</p>
                  )}
                </div>

                {/* Address Field */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border ${
                        errors.address ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
                      placeholder="Ville, Pays"
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address[0]}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-12 py-3 border ${
                  errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
                placeholder="Votre mot de passe"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password[0]}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password_confirmation"
                name="password_confirmation"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.password_confirmation}
                onChange={handleChange}
                className={`w-full pl-10 pr-12 py-3 border ${
                  errors.password_confirmation ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
                placeholder="Confirmez votre mot de passe"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {errors.password_confirmation && (
              <p className="mt-1 text-sm text-red-600">{errors.password_confirmation[0]}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Création en cours...
              </div>
            ) : (
              <div className="flex items-center">
                Créer mon compte
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Déjà un compte ?{' '}
            <button
              onClick={handleSwitchToLogin}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Se connecter
            </button>
          </p>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          En créant un compte, vous acceptez nos{' '}
          <a href="#" className="text-blue-600 hover:text-blue-500">
            conditions d&apos;utilisation
          </a>{' '}
          et notre{' '}
          <a href="#" className="text-blue-600 hover:text-blue-500">
            politique de confidentialité
          </a>
        </div>
      </div>
    </Modal>
  );
};