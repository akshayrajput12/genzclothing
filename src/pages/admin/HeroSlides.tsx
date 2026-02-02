import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { heroService } from '@/services/heroService';
import { HeroSlide } from '@/types/hero';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const HeroSlides = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSlides();
    }, []);

    const fetchSlides = async () => {
        try {
            const data = await heroService.getAllSlides();
            setSlides(data);
        } catch (error) {
            console.error('Error fetching slides:', error);
            toast({
                title: "Error",
                description: "Failed to fetch hero slides",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await heroService.deleteSlide(id);
            toast({
                title: "Success",
                description: "Slide deleted successfully",
            });
            fetchSlides();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const toggleActive = async (slide: HeroSlide) => {
        try {
            await heroService.updateSlide(slide.id, { is_active: !slide.is_active });
            fetchSlides();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#D4B6A2]/20 pb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-serif text-[#4A1C1F] mb-2 tracking-tight">Hero Slides</h1>
                    <p className="text-[#5C4638] font-light text-sm tracking-wide">Manage your homepage hero section slides</p>
                </div>
                <Button
                    onClick={() => navigate('/admin/hero/add')}
                    className="bg-[#4A1C1F] text-white hover:bg-[#5C4638] uppercase tracking-widest text-xs h-10 px-6 rounded-none transition-all duration-300 shadow-md hover:shadow-lg"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Slide
                </Button>
            </div>

            {/* Slides Table */}
            <Card className="border border-[#D4B6A2]/20 shadow-sm bg-white rounded-none">
                <CardHeader className="border-b border-[#D4B6A2]/10 pb-4">
                    <div className="flex justify-between items-center">
                        <CardTitle className="font-serif text-xl text-[#4A1C1F]">Slides List</CardTitle>
                        <span className="text-xs text-[#7E5A34] uppercase tracking-widest">{slides.length} slides</span>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-[#D4B6A2]/20">
                                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Order</TableHead>
                                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Image</TableHead>
                                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Title</TableHead>
                                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Subtitle</TableHead>
                                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Status</TableHead>
                                <TableHead className="text-right text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <TableRow key={index} className="border-[#D4B6A2]/10">
                                        <TableCell><div className="h-4 w-8 bg-[#F9F9F7] rounded-none animate-pulse"></div></TableCell>
                                        <TableCell><div className="h-12 w-20 bg-[#F9F9F7] rounded-none animate-pulse"></div></TableCell>
                                        <TableCell><div className="h-4 w-24 bg-[#F9F9F7] rounded-none animate-pulse"></div></TableCell>
                                        <TableCell><div className="h-4 w-20 bg-[#F9F9F7] rounded-none animate-pulse"></div></TableCell>
                                        <TableCell><div className="h-6 w-16 bg-[#F9F9F7] rounded-none animate-pulse"></div></TableCell>
                                        <TableCell><div className="h-8 w-8 bg-[#F9F9F7] rounded-none animate-pulse ml-auto"></div></TableCell>
                                    </TableRow>
                                ))
                            ) : slides.length > 0 ? (
                                slides.map((slide) => (
                                    <TableRow key={slide.id} className="hover:bg-[#F9F9F7] border-[#D4B6A2]/10 transition-colors">
                                        <TableCell className="font-medium text-[#4A1C1F]">{slide.display_order}</TableCell>
                                        <TableCell>
                                            <img
                                                src={slide.image}
                                                alt={slide.title}
                                                className="w-20 h-10 object-cover border border-[#D4B6A2]/20"
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium text-[#4A1C1F]">{slide.title}</TableCell>
                                        <TableCell className="text-[#5C4638] font-light">{slide.subtitle}</TableCell>
                                        <TableCell>
                                            <Badge
                                                className={`rounded-none px-3 py-1 text-[10px] uppercase tracking-widest font-normal hover:bg-opacity-80 border-0 cursor-pointer ${slide.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                                                    }`}
                                                onClick={() => toggleActive(slide)}
                                            >
                                                {slide.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-[#F9F9F7] rounded-none text-[#5C4638]">
                                                        <span className="sr-only">Open menu</span>
                                                        <span className="text-xl leading-none mb-2">...</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-none border-[#D4B6A2]/30 shadow-lg bg-white p-1 min-w-[120px]">
                                                    <DropdownMenuItem
                                                        onClick={() => navigate(`/admin/hero/edit/${slide.id}`)}
                                                        className="rounded-none hover:bg-[#F9F9F7] cursor-pointer text-xs uppercase tracking-wider py-2 text-[#4A1C1F]"
                                                    >
                                                        <Edit className="mr-2 h-3.5 w-3.5 text-[#B38B46]" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="rounded-none hover:bg-red-50 text-red-600 cursor-pointer text-xs uppercase tracking-wider py-2 focus:bg-red-50 focus:text-red-700"
                                                        onClick={() => handleDelete(slide.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-[#5C4638]">
                                        No slides found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default HeroSlides;
