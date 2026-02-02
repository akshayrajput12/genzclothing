import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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

const AdminProducts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .eq('is_active', true);

      if (error) throw error;
      const categoryNames = data?.map(cat => cat.name) || [];
      setCategories(['all', ...categoryNames]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });

      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.categories?.name === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatus = (product: any) => {
    if (product.stock_quantity <= 0) return 'out-of-stock';
    if (!product.is_active) return 'inactive';
    return 'active';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#D4B6A2]/20 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-[#4A1C1F] mb-2 tracking-tight">Products</h1>
          <p className="text-[#5C4638] font-light text-sm tracking-wide">Manage your product inventory</p>
        </div>
        <Button
          onClick={() => navigate('/admin/products/add')}
          className="bg-[#4A1C1F] text-white hover:bg-[#5C4638] uppercase tracking-widest text-xs h-10 px-6 rounded-none transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="border border-[#D4B6A2]/20 shadow-sm bg-white rounded-none">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[#7E5A34]" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-[#D4B6A2]/30 focus:border-[#B38B46] focus:ring-[#B38B46]/20 rounded-none bg-[#F9F9F7] text-[#4A1C1F]"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-[#D4B6A2]/30 rounded-none text-sm bg-white focus:outline-none focus:border-[#B38B46] text-[#4A1C1F] cursor-pointer min-w-[200px]"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border border-[#D4B6A2]/20 shadow-sm bg-white rounded-none">
        <CardHeader className="border-b border-[#D4B6A2]/10 pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="font-serif text-xl text-[#4A1C1F]">Product List</CardTitle>
            <span className="text-xs text-[#7E5A34] uppercase tracking-widest">{filteredProducts.length} items</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-[#D4B6A2]/20">
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Product</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Category</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Price</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Stock</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Status</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Rating</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Sales</TableHead>
                <TableHead className="text-right text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index} className="border-[#D4B6A2]/10">
                    <TableCell><div className="h-12 w-12 bg-[#F9F9F7] rounded-none animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 w-24 bg-[#F9F9F7] rounded-none animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 w-16 bg-[#F9F9F7] rounded-none animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 w-12 bg-[#F9F9F7] rounded-none animate-pulse"></div></TableCell>
                    <TableCell><div className="h-6 w-20 bg-[#F9F9F7] rounded-none animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 w-12 bg-[#F9F9F7] rounded-none animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 w-12 bg-[#F9F9F7] rounded-none animate-pulse"></div></TableCell>
                    <TableCell><div className="h-8 w-8 bg-[#F9F9F7] rounded-none animate-pulse ml-auto"></div></TableCell>
                  </TableRow>
                ))
              ) : paginatedProducts.length > 0 ? (
                paginatedProducts.map((product: any) => (
                  <TableRow key={product.id} className="hover:bg-[#F9F9F7] border-[#D4B6A2]/10 transition-colors group">
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 bg-[#F9F9F7] overflow-hidden relative border border-[#D4B6A2]/20">
                          <img
                            src={product.images?.[0] || '/placeholder.svg'}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <div>
                          <p className="font-medium font-serif text-[#4A1C1F] text-lg">{product.name}</p>
                          <p className="text-xs text-[#7E5A34] uppercase tracking-wider mt-1">SKU: {product.sku}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-light text-[#5C4638]">{product.categories?.name || 'Unknown'}</TableCell>
                    <TableCell className="font-medium text-[#4A1C1F]">₹{product.price}</TableCell>
                    <TableCell className="text-[#5C4638]">{product.stock_quantity}</TableCell>
                    <TableCell>
                      <Badge className={`rounded-none px-3 py-1 text-[10px] uppercase tracking-widest font-normal hover:bg-opacity-80 border-0 ${product.stock_quantity <= 0 ? 'bg-red-50 text-red-600' :
                        !product.is_active ? 'bg-gray-100 text-gray-500' :
                          'bg-green-50 text-green-700'
                        }`}>
                        {getStatus(product)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#5C4638] space-x-1">
                      <span className="text-[#B38B46]">★</span>
                      <span>{product.rating || 'N/A'}</span>
                    </TableCell>
                    <TableCell className="text-[#5C4638]">{product.sales || 0}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-[#F9F9F7] rounded-none data-[state=open]:bg-[#F9F9F7] text-[#5C4638]">
                            <span className="sr-only">Open menu</span>
                            <span className="text-xl leading-none mb-2">...</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-none border-[#D4B6A2]/30 shadow-lg bg-white p-1 min-w-[120px]">
                          <DropdownMenuItem
                            onClick={() => navigate(`/product/${product.sku || product.id}`)}
                            className="rounded-none hover:bg-[#F9F9F7] cursor-pointer text-xs uppercase tracking-wider py-2 text-[#4A1C1F]"
                          >
                            <Eye className="mr-2 h-3.5 w-3.5 text-[#B38B46]" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                            className="rounded-none hover:bg-[#F9F9F7] cursor-pointer text-xs uppercase tracking-wider py-2 text-[#4A1C1F]"
                          >
                            <Edit className="mr-2 h-3.5 w-3.5 text-[#B38B46]" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="rounded-none hover:bg-red-50 text-red-600 cursor-pointer text-xs uppercase tracking-wider py-2 focus:bg-red-50 focus:text-red-700"
                            onClick={() => handleDelete(product.id)}
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
                  <TableCell colSpan={8} className="h-24 text-center text-[#5C4638]">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-4 border border-[#D4B6A2]/20 shadow-sm">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="rounded-none border-[#D4B6A2]/30 text-[#5C4638] hover:text-[#4A1C1F] hover:bg-[#F9F9F7] uppercase tracking-widest text-xs"
          >
            Previous
          </Button>
          <span className="text-xs text-[#7E5A34] uppercase tracking-widest">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="rounded-none border-[#D4B6A2]/30 text-[#5C4638] hover:text-[#4A1C1F] hover:bg-[#F9F9F7] uppercase tracking-widest text-xs"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;