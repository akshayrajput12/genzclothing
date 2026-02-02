import { supabase } from '@/integrations/supabase/client';

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string | null;
  image: string;
  text: string;
}

export const fetchTestimonials = async (): Promise<Testimonial[]> => {
  const { data, error } = await supabase
    .from('testimonials')
    .select('id, name, role, company, image_url, text')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }

  return data.map(testimonial => ({
    id: testimonial.id,
    name: testimonial.name,
    role: testimonial.role,
    company: testimonial.company,
    image: testimonial.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=random`,
    text: testimonial.text
  }));
};

export const testimonials = [
  {
    text: "The bridal lehenga I bought was absolutely stunning! The embroidery work was exquisite and perfect for my big day.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=faces",
    name: "Priya Sharma",
    role: "Happy Bride",
  },
  {
    text: "I ordered a sherwani for my brother's wedding, and the fit was impeccable. Great quality fabric and timely delivery.",
    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0e1607d?w=150&h=150&fit=crop&crop=faces",
    name: "Rajesh Patel",
    role: "Satisfied Customer",
  },
  {
    text: "Their collection of sarees is unmatched. I found the perfect silk saree for a festival, and I got so many compliments!",
    image: "https://images.unsplash.com/photo-1563375853373-15b7816d3c3d?w=150&h=150&fit=crop&crop=faces",
    name: "Ananya Desai",
    role: "Fashion Enthusiast",
  },
  {
    text: "The custom tailoring service is fantastic. My suit fits me like a glove. Highly recommend Paridhan Haat for formal wear.",
    image: "https://images.unsplash.com/photo-1549476464-37392f717541?w=150&h=150&fit=crop&crop=faces",
    name: "Meera Iyer",
    role: "Professional",
  },
  {
    text: "I've shopped from many places, but Paridhan Haat stands out for its blend of tradition and modernity. A truly premium experience.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=150&h=150&fit=crop&crop=faces",
    name: "Vikram Singh",
    role: "Lifestyle Blogger",
  },
  {
    text: "Excellent customer service and fast delivery. The packaging was beautiful, and the dress looked exactly like the photos.",
    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0e1607d?w=150&h=150&fit=crop&crop=faces",
    name: "Sunita Reddy",
    role: "Regular Shopper",
  },
  {
    text: "The Indo-Western collection is trendy and chic. Perfect for cocktail parties and evening events. Love it!",
    image: "https://images.unsplash.com/photo-1519351414974-61d8e594c5d6?w=150&h=150&fit=crop&crop=faces",
    name: "Arjun Malhotra",
    role: "Event Planner",
  },
  {
    text: "I appreciate the attention to detail in every garment. You can tell they use high-quality materials. Worth every penny.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=faces",
    name: "Kavita Nair",
    role: "Designer",
  },
  {
    text: "Finding traditional wear for kids is usually hard, but their kids' collection is adorable and comfortable.",
    image: "https://images.unsplash.com/photo-1549476464-37392f717541?w=150&h=150&fit=crop&crop=faces",
    name: "Deepak Bose",
    role: "Parent",
  },
];