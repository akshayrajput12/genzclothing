import { supabase } from '@/integrations/supabase/client';
import { HeroSlide, HeroSlideInput } from '@/types/hero';

export const heroService = {
    async getAllSlides() {
        const { data, error } = await supabase
            .from('hero_slides')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;
        return data as HeroSlide[];
    },

    async getActiveSlides() {
        const { data, error } = await supabase
            .from('hero_slides')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (error) throw error;
        return data as HeroSlide[];
    },

    async getSlideById(id: string) {
        const { data, error } = await supabase
            .from('hero_slides')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as HeroSlide;
    },

    async createSlide(slide: HeroSlideInput) {
        const { data, error } = await supabase
            .from('hero_slides')
            .insert([slide])
            .select()
            .single();

        if (error) throw error;
        return data as HeroSlide;
    },

    async updateSlide(id: string, slide: Partial<HeroSlideInput>) {
        const { data, error } = await supabase
            .from('hero_slides')
            .update(slide)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as HeroSlide;
    },

    async deleteSlide(id: string) {
        const { error } = await supabase
            .from('hero_slides')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async updateOrder(slides: HeroSlide[]) {
        // This could be optimized to batch updates
        const updates = slides.map((slide, index) =>
            supabase
                .from('hero_slides')
                .update({ display_order: index + 1 })
                .eq('id', slide.id)
        );

        await Promise.all(updates);
    }
};
