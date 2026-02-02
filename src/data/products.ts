import { Product } from '../store/useStore';

export const products: Product[] = [
  {
    id: '1',
    name: 'Royal Silk Saree',
    price: 14999,
    originalPrice: 19999,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80',
    category: 'Sarees',
    rating: 4.8,
    description: 'A luxurious silk saree with intricate gold zari work, perfect for weddings and special occasions.',
    product_specs: {
      fabric: 'Pure Silk',
      pattern: 'Traditional Zari',
      occasion: 'Wedding',
      origin: 'Banaras'
    },
    care_instructions: 'Dry Clean Only',
    inStock: true,
    slug: 'royal-silk-saree',
  },
  {
    id: '2',
    name: 'Embroidered Bridal Lehenga',
    price: 45999,
    originalPrice: 55000,
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80',
    category: 'Lehengas',
    rating: 4.9,
    description: 'Hand-embroidered bridal lehenga in rich maroon, featuring velvet fabric and crystal embellishments.',
    product_specs: {
      fabric: 'Velvet',
      pattern: 'Embroidered',
      occasion: 'Bridal',
      fit: 'Regular'
    },
    care_instructions: 'Professional Dry Clean',
    inStock: true,
    slug: 'embroidered-bridal-lehenga',
  },
  {
    id: '3',
    name: 'Classic Men\'s Sherwani',
    price: 24999,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80',
    category: 'Men\'s Ethnic',
    rating: 4.7,
    description: 'A sophisticated ivory sherwani tailored for the modern groom, paired with a matching churidar.',
    product_specs: {
      fabric: 'Brocade',
      pattern: 'Self-Design',
      occasion: 'Wedding',
      fit: 'Slim Fit'
    },
    care_instructions: 'Dry Clean Only',
    inStock: true,
    slug: 'classic-mens-sherwani',
  },
  {
    id: '4',
    name: 'Contemporary Anarkali Suit',
    price: 8999,
    originalPrice: 10999,
    image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0e1607d?auto=format&fit=crop&q=80',
    category: 'Suits',
    rating: 4.9,
    description: 'Flowy floor-length Anarkali suit with delicate floral prints and a chiffon dupatta.',
    product_specs: {
      fabric: 'Georgette',
      pattern: 'Floral Print',
      occasion: 'Party',
      neck_type: 'Round Neck'
    },
    care_instructions: 'Gentle Hand Wash or Dry Clean',
    inStock: true,
    slug: 'contemporary-anarkali-suit',
  },
  {
    id: '5',
    name: 'Designer Kurta Set',
    price: 3499,
    image: 'https://images.unsplash.com/photo-1631233859262-0d62bf3b4946?auto=format&fit=crop&q=80',
    category: 'Men\'s Ethnic',
    rating: 4.8,
    description: 'Stylish cotton kurta set in pastel shades, ideal for festive gatherings and casual events.',
    product_specs: {
      fabric: 'Cotton Blend',
      pattern: 'Solid',
      occasion: 'Festive',
      sleeve_type: 'Long Sleeves'
    },
    care_instructions: 'Machine Wash Cold',
    inStock: true,
    slug: 'designer-kurta-set',
  },
  {
    id: '6',
    name: 'Handwoven Pashmina Shawl',
    price: 12999,
    image: 'https://images.unsplash.com/photo-1609357912206-6dc8417c827f?auto=format&fit=crop&q=80',
    category: 'Accessories',
    rating: 4.6,
    description: 'Authentic Kashmiri Pashmina shawl, incredibly soft and warm, featuring traditional hand embroidery.',
    product_specs: {
      fabric: 'Pashmina Wool',
      pattern: 'Embroidered',
      origin: 'Kashmir'
    },
    care_instructions: 'Dry Clean Only',
    inStock: true,
    slug: 'handwoven-pashmina-shawl',
  },
];

export const categories = [
  'All',
  'Sarees',
  'Lehengas',
  'Suits',
  'Men\'s Ethnic',
  'Gowns',
  'Accessories',
  'Fabrics'
];

export const bestSellers = products.slice(0, 4);