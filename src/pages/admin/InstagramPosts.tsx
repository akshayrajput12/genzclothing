import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  PlusCircle,
  Trash2,
  Save,
  AlertCircle,
  Eye,
  Instagram
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface InstagramPost {
  id: string;
  embed_html: string;
  caption: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const InstagramPosts = () => {
  const supabaseClient = supabase;
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPost, setNewPost] = useState({
    embed_html: '',
    caption: '',
    is_active: true,
    sort_order: 0
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<InstagramPost | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from('instagram_posts')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching Instagram posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch Instagram posts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    try {
      setSaving(true);
      const { error } = await supabaseClient
        .from('instagram_posts')
        .insert([{
          embed_html: newPost.embed_html,
          caption: newPost.caption,
          is_active: newPost.is_active,
          sort_order: newPost.sort_order || posts.length + 1
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Instagram post created successfully'
      });

      setNewPost({
        embed_html: '',
        caption: '',
        is_active: true,
        sort_order: 0
      });

      fetchPosts();
    } catch (error) {
      console.error('Error creating Instagram post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create Instagram post',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePost = async () => {
    if (!editData) return;

    try {
      setSaving(true);
      const { error } = await supabaseClient
        .from('instagram_posts')
        .update({
          embed_html: editData.embed_html,
          caption: editData.caption,
          is_active: editData.is_active,
          sort_order: editData.sort_order
        })
        .eq('id', editData.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Instagram post updated successfully'
      });

      setEditingId(null);
      setEditData(null);
      fetchPosts();
    } catch (error) {
      console.error('Error updating Instagram post:', error);
      toast({
        title: 'Error',
        description: 'Failed to update Instagram post',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      const { error } = await supabaseClient
        .from('instagram_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Instagram post deleted successfully'
      });

      fetchPosts();
    } catch (error) {
      console.error('Error deleting Instagram post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete Instagram post',
        variant: 'destructive'
      });
    }
  };

  const startEditing = (post: InstagramPost) => {
    setEditingId(post.id);
    setEditData({ ...post });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData(null);
  };

  const movePost = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = posts.findIndex(post => post.id === id);
    if (currentIndex === -1) return;

    let newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= posts.length) return;

    const updatedPosts = [...posts];
    const temp = updatedPosts[currentIndex].sort_order;
    updatedPosts[currentIndex].sort_order = updatedPosts[newIndex].sort_order;
    updatedPosts[newIndex].sort_order = temp;

    setPosts(updatedPosts);

    try {
      // Update both posts in database
      const { error } = await supabaseClient
        .from('instagram_posts')
        .update({ sort_order: updatedPosts[currentIndex].sort_order })
        .eq('id', updatedPosts[currentIndex].id);

      if (error) throw error;

      const { error: error2 } = await supabaseClient
        .from('instagram_posts')
        .update({ sort_order: updatedPosts[newIndex].sort_order })
        .eq('id', updatedPosts[newIndex].id);

      if (error2) throw error2;
    } catch (error) {
      console.error('Error updating sort order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update sort order',
        variant: 'destructive'
      });
      fetchPosts(); // Revert to original order
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B38B46]"></div>
      </div>
    );
  }

  const CardStyle = "border border-[#D4B6A2]/20 shadow-sm bg-white hover:shadow-md transition-all duration-300";
  const LabelStyle = "text-[#7E5A34] text-xs uppercase tracking-widest font-medium";
  const InputStyle = "border-[#D4B6A2]/30 focus:border-[#B38B46] bg-[#F9F9F7] text-[#4A1C1F] rounded-none";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b border-[#D4B6A2]/20 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-[#4A1C1F] tracking-tight mb-1">Instagram Feed</h1>
          <p className="text-[#5C4638] font-light text-sm tracking-wide">Manage your social media presence</p>
        </div>
      </div>

      <Card className={CardStyle}>
        <CardHeader className="border-b border-[#D4B6A2]/10 pb-4">
          <CardTitle className="font-serif text-lg text-[#4A1C1F] flex items-center">
            <Instagram className="h-5 w-5 mr-2 text-[#E1306C]" />
            Add New Instagram Post
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="embed_html" className={LabelStyle}>Embed HTML</Label>
              <Textarea
                id="embed_html"
                placeholder="Paste Instagram embed HTML here"
                value={newPost.embed_html}
                onChange={(e) => setNewPost({ ...newPost, embed_html: e.target.value })}
                rows={6}
                className={InputStyle}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption" className={LabelStyle}>Caption</Label>
              <Textarea
                id="caption"
                placeholder="Enter caption for the post"
                value={newPost.caption}
                onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
                rows={3}
                className={InputStyle}
              />
            </div>
          </div>

          <div className="flex items-center space-x-6 bg-[#F9F9F7] p-4 rounded border border-[#D4B6A2]/10">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={newPost.is_active}
                onCheckedChange={(checked) => setNewPost({ ...newPost, is_active: checked })}
                className="data-[state=checked]:bg-[#B38B46]"
              />
              <Label htmlFor="is_active" className={LabelStyle}>Active</Label>
            </div>

            <div className="space-y-2 flex items-center gap-2">
              <Label htmlFor="sort_order" className={`${LabelStyle} mt-0`}>Sort Order:</Label>
              <Input
                id="sort_order"
                type="number"
                min="0"
                value={newPost.sort_order || ''}
                onChange={(e) => setNewPost({ ...newPost, sort_order: parseInt(e.target.value) || 0 })}
                className={`w-24 ${InputStyle} h-8`}
              />
            </div>
          </div>

          <Button onClick={handleCreatePost} disabled={saving} className="bg-[#4A1C1F] hover:bg-[#5C4638] text-white uppercase tracking-widest text-xs rounded-none transition-all duration-300">
            <PlusCircle className="mr-2 h-4 w-4" />
            {saving ? 'Adding...' : 'Add Post'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-serif text-[#4A1C1F]">Existing Posts</h2>

        {posts.length === 0 ? (
          <div className="text-center py-12 text-[#5C4638] bg-[#F9F9F7] border border-[#D4B6A2]/20 rounded">
            <AlertCircle className="mx-auto h-12 w-12 text-[#B38B46] mb-2" />
            <p className="font-light">No Instagram posts found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className={`${CardStyle} overflow-hidden`}>
                <CardContent className="p-4">
                  {editingId === post.id && editData ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className={LabelStyle}>Embed HTML</Label>
                        <Textarea
                          value={editData.embed_html}
                          onChange={(e) => setEditData({ ...editData, embed_html: e.target.value })}
                          rows={4}
                          className={InputStyle}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className={LabelStyle}>Caption</Label>
                        <Textarea
                          value={editData.caption}
                          onChange={(e) => setEditData({ ...editData, caption: e.target.value })}
                          rows={2}
                          className={InputStyle}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editData.is_active}
                          onCheckedChange={(checked) => setEditData({ ...editData, is_active: checked })}
                          className="data-[state=checked]:bg-[#B38B46]"
                        />
                        <Label className={LabelStyle}>Active</Label>
                      </div>

                      <div className="space-y-2">
                        <Label className={LabelStyle}>Sort Order</Label>
                        <Input
                          type="number"
                          min="0"
                          value={editData.sort_order}
                          onChange={(e) => setEditData({ ...editData, sort_order: parseInt(e.target.value) || 0 })}
                          className={InputStyle}
                        />
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button onClick={handleUpdatePost} size="sm" disabled={saving} className="bg-[#4A1C1F] hover:bg-[#5C4638] text-white">
                          <Save className="mr-2 h-4 w-4" />
                          {saving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button variant="outline" onClick={cancelEditing} size="sm" className="border-[#D4B6A2] text-[#5C4638] hover:bg-[#F9F9F7]">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="aspect-square overflow-hidden rounded bg-[#F9F9F7] border border-[#D4B6A2]/20">
                        <div
                          className="w-full h-full flex items-center justify-center p-0.5 overflow-hidden scale-[0.85] origin-top"
                          dangerouslySetInnerHTML={{ __html: post.embed_html }}
                        />
                      </div>

                      <p className="text-sm line-clamp-2 text-[#5C4638]">{post.caption}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-[#D4B6A2]/10">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-none ${post.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {post.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-[10px] text-[#7E5A34] uppercase tracking-wider">
                            Order: {post.sort_order}
                          </span>
                        </div>

                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(post)}
                            className="text-[#7E5A34] hover:text-[#4A1C1F] h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-400 hover:text-red-600 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => movePost(post.id, 'up')}
                          disabled={posts.findIndex(p => p.id === post.id) === 0}
                          className="flex-1 border-[#D4B6A2]/30 text-[#5C4638] h-7 text-xs"
                        >
                          ↑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => movePost(post.id, 'down')}
                          disabled={posts.findIndex(p => p.id === post.id) === posts.length - 1}
                          className="flex-1 border-[#D4B6A2]/30 text-[#5C4638] h-7 text-xs"
                        >
                          ↓
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstagramPosts;