import React, { useState, useEffect } from 'react';
import { Package, X, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  images: string[];
  is_active: boolean;
}

interface CategoryProductManagerProps {
  categoryId: string;
  categoryName: string;
  onProductRemoved: () => void;
}

const CategoryProductManager: React.FC<CategoryProductManagerProps> = ({
  categoryId,
  categoryName,
  onProductRemoved
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [removing, setRemoving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (categoryId) {
      fetchCategoryProducts();
    }
  }, [categoryId]);

  const fetchCategoryProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity, images, is_active')
        .eq('category_id', categoryId)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching category products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch category products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProduct = async (productId: string, productName: string) => {
    setRemoving(productId);
    try {
      // Set category_id to null instead of deleting the product
      const { error } = await supabase
        .from('products')
        .update({ category_id: null })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `"${productName}" has been removed from "${categoryName}" category.`,
      });

      // Refresh the products list
      fetchCategoryProducts();
      onProductRemoved();
    } catch (error: any) {
      console.error('Error removing product from category:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove product from category",
        variant: "destructive",
      });
    } finally {
      setRemoving(null);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && product.is_active) ||
      (statusFilter === 'inactive' && !product.is_active);
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Category Products</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="w-5 h-5" />
          <span>Products in "{categoryName}" ({products.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products List */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'No products match your filters.' 
                : 'No products in this category.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredProducts.map((product) => (
              <div key={product.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border">
                <img
                  src={product.images?.[0] || '/placeholder.svg'}
                  alt={product.name}
                  className="w-16 h-16 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-sm text-gray-600">₹{product.price}</span>
                    <Badge variant="secondary" className="text-xs">
                      Stock: {product.stock_quantity}
                    </Badge>
                    <Badge 
                      variant={product.is_active ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {product.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveProduct(product.id, product.name)}
                  disabled={removing === product.id}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  {removing === product.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}

        {products.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Removing products from this category will not delete them. 
              They will become uncategorized and can be reassigned to other categories later.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryProductManager;