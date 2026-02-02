import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CategoryDeleteModal from '@/components/CategoryDeleteModal';

interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  image: string;
}

const AdminCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    categoryId: string;
    categoryName: string;
  }>({
    isOpen: false,
    categoryId: '',
    categoryName: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);

      // Fetch categories with product count
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select(`
          *,
          products(count)
        `)
        .order('created_at', { ascending: false });

      if (categoriesError) throw categoriesError;

      const formattedCategories = categoriesData?.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description || '',
        productCount: category.products?.length || 0,
        status: category.is_active ? 'active' as const : 'inactive' as const,
        createdAt: new Date(category.created_at).toLocaleDateString(),
        image: category.image_url || '/placeholder.svg'
      })) || [];

      setCategories(formattedCategories);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      categoryId: id,
      categoryName: name
    });
  };

  const handleDeleteConfirm = () => {
    fetchCategories(); // Refresh the list after deletion
  };

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      categoryId: '',
      categoryName: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B38B46]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b border-[#D4B6A2]/20 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-[#4A1C1F] tracking-tight mb-1">Categories</h1>
          <p className="text-[#5C4638] font-light text-sm tracking-wide">Organize your products catalog</p>
        </div>
        <Button
          onClick={() => navigate('/admin/categories/add')}
          className="bg-[#4A1C1F] hover:bg-[#5C4638] text-white uppercase tracking-widest text-xs h-10 px-6 rounded-none transition-all duration-300 shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-[#D4B6A2]/20 shadow-sm bg-white hover:shadow-md transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">Total Categories</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <Package className="h-4 w-4 text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-[#4A1C1F]">{categories.length}</div>
          </CardContent>
        </Card>

        <Card className="border border-[#D4B6A2]/20 shadow-sm bg-white hover:shadow-md transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">Active Categories</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <Package className="h-4 w-4 text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-[#4A1C1F]">
              {categories.filter(cat => cat.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#D4B6A2]/20 shadow-sm bg-white hover:shadow-md transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">Total Products</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <Package className="h-4 w-4 text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif text-[#4A1C1F]">
              {categories.reduce((sum, cat) => sum + cat.productCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card className="border border-[#D4B6A2]/20 shadow-sm bg-white rounded-none">
        <CardHeader className="border-b border-[#D4B6A2]/10 pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="font-serif text-xl text-[#4A1C1F]">Categories List</CardTitle>
            <span className="text-xs text-[#7E5A34] uppercase tracking-widest">{categories.length} records</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-[#D4B6A2]/20">
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Category</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Description</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Products</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Status</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Created</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id} className="hover:bg-[#F9F9F7] border-[#D4B6A2]/10 transition-colors group">
                  <TableCell className="py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded border border-[#D4B6A2]/20 overflow-hidden">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div>
                        <p className="font-medium font-serif text-[#4A1C1F]">{category.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-[#5C4638] max-w-xs truncate font-light">
                      {category.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-none border-[#D4B6A2]/30 text-[#5C4638] font-normal">
                      {category.productCount} products
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`rounded-none px-3 py-1 text-[10px] uppercase tracking-widest font-normal hover:bg-opacity-80 border-0 ${category.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}
                    >
                      {category.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[#5C4638] font-light">{category.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/categories/edit/${category.id}`)}
                        className="text-[#7E5A34] hover:text-[#4A1C1F] hover:bg-[#F9F9F7]"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(category.id, category.name)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Modal */}
      <CategoryDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        categoryId={deleteModal.categoryId}
        categoryName={deleteModal.categoryName}
      />
    </div>
  );
};

export default AdminCategories;