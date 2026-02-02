-- Create testimonials table
create table public.testimonials (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    role text not null,
    company text,
    image_url text,
    text text not null,
    rating integer check (rating >= 1 and rating <= 5),
    is_active boolean default true,
    sort_order integer default 0,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create indexes for better performance
create index idx_testimonials_active on public.testimonials (is_active);
create index idx_testimonials_sort_order on public.testimonials (sort_order);
create index idx_testimonials_created_at on public.testimonials (created_at);

-- Enable Row Level Security
alter table public.testimonials enable row level security;

-- Create policies
create policy "Admin can manage testimonials"
    on public.testimonials
    for all
    to authenticated
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.is_admin = true
        )
    )
    with check (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.is_admin = true
        )
    );

create policy "Public can view active testimonials"
    on public.testimonials
    for select
    to anon, authenticated
    using (is_active = true);

-- Insert sample Indian user testimonials with genuine reviews
-- Create testimonials table
create table public.testimonials (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    role text not null,
    company text,
    image_url text,
    text text not null,
    rating integer check (rating >= 1 and rating <= 5),
    is_active boolean default true,
    sort_order integer default 0,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create indexes for better performance
create index idx_testimonials_active on public.testimonials (is_active);
create index idx_testimonials_sort_order on public.testimonials (sort_order);
create index idx_testimonials_created_at on public.testimonials (created_at);

-- Enable Row Level Security
alter table public.testimonials enable row level security;

-- Create policies
create policy "Admin can manage testimonials"
    on public.testimonials
    for all
    to authenticated
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.is_admin = true
        )
    )
    with check (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.is_admin = true
        )
    );

create policy "Public can view active testimonials"
    on public.testimonials
    for select
    to anon, authenticated
    using (is_active = true);

-- Insert sample Indian user testimonials with genuine reviews
insert into public.testimonials (name, role, company, image_url, text, rating, is_active, sort_order) values
('Rajesh Kumar', 'Fashion Blogger', 'Mumbai Style Diaries', 'https://images.unsplash.com/photo-1567532939604-b6b5b0e1607d?w=150&h=150&fit=crop&crop=faces', 'The fit of the sherwani I ordered was impeccable. The team at Paridhan Haat really understands traditional wear for modern men.', 5, true, 1),
('Priya Sharma', 'Bride', 'Delhi', 'https://images.unsplash.com/photo-1519351414974-61d8e594c5d6?w=150&h=150&fit=crop&crop=faces', 'My bridal lehenga was a dream come true. The embroidery details were stunning and the fabric felt so premium. Everyone loved it!', 5, true, 2),
('Amit Patel', 'Regular Customer', 'Ahmedabad', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=150&h=150&fit=crop&crop=faces', 'I exclusively buy my formal wear from Paridhan Haat now. The quality of cotton and linen they use is unmatched.', 4, true, 3),
('Sneha Reddy', 'Designer', 'Hyderabad', 'https://images.unsplash.com/photo-1549476464-37392f717541?w=150&h=150&fit=crop&crop=faces', 'As a designer myself, I appreciate the craftsmanship. The stitching is clean and the finish is excellent.', 5, true, 4),
('Vikram Singh', 'Wedding Planner', 'Chennai Events', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=faces', 'I recommend Paridhan Haat to all my grooms. Their custom tailoring service ensures everyone looks their best on the big day.', 5, true, 5),
('Anjali Mehta', 'Corporate Professional', 'Pune', 'https://images.unsplash.com/photo-1563375853373-15b7816d3c3d?w=150&h=150&fit=crop&crop=faces', 'Paridhan Haat has the best collection of ethnic wear. I bought a saree for my wedding and it was perfect! The fabric quality is amazing.breathable and stylish.', 4, true, 6),
('Karan Desai', 'Student', 'Bangalore', 'https://images.unsplash.com/photo-1549476464-37392f717541?w=150&h=150&fit=crop&crop=faces', 'Bought a kurta for my college fest. It was trendy yet traditional. Got so many compliments!', 5, true, 7),
('Meera Iyer', 'Homemaker', 'Kolkata', 'https://images.unsplash.com/photo-1519351414974-61d8e594c5d6?w=150&h=150&fit=crop&crop=faces', 'The durability of their clothes is amazing. Even after multiple washes, the color and texture remain as good as new.', 5, true, 8),
('Rohit Malhotra', 'Banker', 'Jaipur', 'https://images.unsplash.com/photo-1567532939604-b6b5b0e1607d?w=150&h=150&fit=crop&crop=faces', 'Authentic ethnic wear at reasonable prices. The material feels very rich and comfortable.', 4, true, 9),
('Neha Gupta', 'Influencer', 'Lucknow', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=150&h=150&fit=crop&crop=faces', 'Stunning collection! Every piece tells a story. The fusion wear is my absolute favorite.', 5, true, 10);