export interface HeroSlide {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    cta_text: string;
    image: string;
    display_order: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export type HeroSlideInput = Omit<HeroSlide, 'id' | 'created_at' | 'updated_at'>;
