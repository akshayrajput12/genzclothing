import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Users, Truck, Shield } from 'lucide-react';
import AboutUsSection from '@/components/ui/about-us-section';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <AboutUsSection />
    </div>
  );
};

export default About;