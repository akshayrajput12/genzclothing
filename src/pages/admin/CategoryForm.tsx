import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import CategoryProductManager from '@/components/CategoryProductManager';

interface Category {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  image_url: string;
  created_at?: string;
  updated_at?: string;
}

interface CategoryFormProps {
  category?: Category;
  isEdit?: boolean;
}

const CategoryForm = ({ category: propCategory, isEdit = false }: CategoryFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();

  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    description: '',
    is_active: true,
    image_url: ''
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    if (id && isEdit) {
      fetchCategory();
    } else if (propCategory) {
      setFormData({
        name: propCategory.name,
        description: propCategory.description,
        is_active: propCategory.is_active,
        image_url: propCategory.image_url
      });
    }
  }, [id, isEdit, propCategory]);

  const fetchCategory = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          products(count)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        name: data.name,
        description: data.description,
        is_active: data.is_active,
        image_url: data.image_url
      });

      setProductCount(data.products?.length || 0);
    } catch (error) {
      console.error('Error fetching category:', error);
      toast({
        title: "Error",
        description: "Failed to fetch category details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProductRemoved = () => {
    setProductCount(prev => Math.max(0, prev - 1));
  };

  const handleInputChange = (field: keyof Category, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('category-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('category-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      handleInputChange('image_url', imageUrl);
    }
  };

  const removeImage = async () => {
    if (formData.image_url) {
      try {
        const url = new URL(formData.image_url);
        const pathParts = url.pathname.split('/');
        const filePath = pathParts.slice(pathParts.indexOf('categories')).join('/');

        await supabase.storage
          .from('category-images')
          .remove([filePath]);
      } catch (error) {
        console.error('Error removing image:', error);
      }
    }
    handleInputChange('image_url', '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description) {
      toast({
        title: "Missing required fields",
        description: "Please fill in name and description.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isEdit && id) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            description: formData.description,
            is_active: formData.is_active,
            image_url: formData.image_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert({
            name: formData.name,
            description: formData.description,
            is_active: formData.is_active,
            image_url: formData.image_url
          });

        if (error) throw error;
      }

      toast({
        title: isEdit ? "Category updated!" : "Category created!",
        description: `${formData.name} has been ${isEdit ? 'updated' : 'added'} successfully.`,
      });

      navigate('/admin/categories');
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: "Failed to save category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const CardStyle = "border border-[#D4B6A2]/20 shadow-sm bg-white hover:shadow-md transition-all duration-300";
  const LabelStyle = "text-[#7E5A34] text-xs uppercase tracking-widest font-medium";
  const InputStyle = "border-[#D4B6A2]/30 focus:border-[#B38B46] bg-[#F9F9F7] text-[#4A1C1F] rounded-none focus:ring-[#B38B46]/20";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-[#D4B6A2]/20 pb-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/categories')}
            className="text-[#5C4638] hover:text-[#4A1C1F] hover:bg-[#F9F9F7] p-0 mb-2 h-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="uppercase tracking-widest text-xs">Back to Categories</span>
          </Button>
          <h1 className="text-3xl font-serif text-[#4A1C1F] tracking-tight">
            {isEdit ? 'Edit Category' : 'Add New Category'}
          </h1>
          <p className="text-[#5C4638] font-light text-sm tracking-wide">
            {isEdit ? 'Update category details and managing products' : 'Create a new product category'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className={CardStyle}>
            <CardHeader className="border-b border-[#D4B6A2]/10 pb-4">
              <CardTitle className="font-serif text-lg text-[#4A1C1F]">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="name" className={LabelStyle}>Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter category name"
                  required
                  className={InputStyle}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className={LabelStyle}>Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter category description"
                  rows={4}
                  required
                  className={InputStyle}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className={LabelStyle}>Status</Label>
                  <Select
                    value={formData.is_active ? 'active' : 'inactive'}
                    onValueChange={(value) => handleInputChange('is_active', value === 'active')}
                  >
                    <SelectTrigger className="border-[#D4B6A2]/30 bg-[#F9F9F7] text-[#4A1C1F] rounded-none">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#D4B6A2]/20">
                      <SelectItem value="active" className="text-green-700">Active</SelectItem>
                      <SelectItem value="inactive" className="text-gray-500">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Management - Only show in edit mode */}
          {isEdit && id && (
            <div className="border border-[#D4B6A2]/20 rounded-none overflow-hidden">
              <CategoryProductManager
                categoryId={id}
                categoryName={formData.name || 'Category'}
                onProductRemoved={handleProductRemoved}
              />
            </div>

          )}

        </div>

        <div className="space-y-6">
          <Card className={CardStyle}>
            <CardHeader className="border-b border-[#D4B6A2]/10 pb-4">
              <CardTitle className="font-serif text-lg text-[#4A1C1F]">Category Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="image" className={LabelStyle}>Upload Image</Label>
                <input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('imageFile')?.click()}
                  className="w-full border-[#D4B6A2]/50 text-[#5C4638] hover:bg-[#F9F9F7] uppercase tracking-widest text-xs rounded-none h-12"
                  disabled={uploadingImage}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingImage ? 'Uploading...' : 'Choose Image'}
                </Button>
              </div>

              {!formData.image_url && (
                <div className="border border-dashed border-[#D4B6A2]/40 rounded-none p-8 text-center bg-[#F9F9F7]">
                  <Upload className="h-8 w-8 mx-auto text-[#D4B6A2] mb-2" />
                  <p className="text-sm text-[#5C4638]">
                    Upload category image
                  </p>
                  <p className="text-xs text-[#7E5A34]/70 mt-1">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              )}

              {formData.image_url && (
                <div className="relative group">
                  <img
                    src={formData.image_url}
                    alt="Category preview"
                    className="w-full h-48 object-cover border border-[#D4B6A2]/20 rounded-none"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="rounded-none"
                      onClick={removeImage}
                      disabled={uploadingImage}
                    >
                      <X className="h-4 w-4 mr-2" /> Remove
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Stats - Only show in edit mode */}
          {isEdit && (
            <Card className={CardStyle}>
              <CardHeader className="border-b border-[#D4B6A2]/10 pb-4">
                <CardTitle className="font-serif text-lg text-[#4A1C1F]">Category Stats</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#D4B6A2]/10 pb-2">
                    <span className="text-xs uppercase tracking-widest text-[#7E5A34]">Total Products</span>
                    <span className="font-serif text-lg text-[#4A1C1F]">{productCount}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs uppercase tracking-widest text-[#7E5A34]">Status</span>
                    <span className={`text-xs uppercase tracking-widest font-bold ${formData.is_active ? 'text-green-700' : 'text-gray-500'}`}>
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className={`${CardStyle} border-[#B38B46]/20 bg-[#F5EFE7]/30`}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full bg-[#4A1C1F] hover:bg-[#5C4638] text-white uppercase tracking-widest text-xs h-12 rounded-none transition-all duration-300 shadow-md hover:shadow-lg"
                  disabled={loading || uploadingImage}
                >
                  {loading ? 'Saving...' : isEdit ? 'Update Category' : 'Create Category'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-[#D4B6A2] text-[#5C4638] hover:bg-[#4A1C1F] hover:text-white hover:border-[#4A1C1F] uppercase tracking-widest text-xs h-10 rounded-none transition-all"
                  onClick={() => navigate('/admin/categories')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;