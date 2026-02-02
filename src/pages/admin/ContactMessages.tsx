import { useState, useEffect } from 'react';
import { Mail, Phone, User, Calendar, MessageSquare, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

const AdminContactMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages((data as unknown as ContactMessage[]) || []);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contact messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: string, status: string, priority?: string) => {
    try {
      setUpdating(true);

      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (priority) {
        updateData.priority = priority;
      }

      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('contact_messages')
        .update(updateData)
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Message status updated to ${status}`,
      });

      fetchMessages();
      if (selectedMessage?.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: status as any });
      }
    } catch (error) {
      console.error('Error updating message status:', error);
      toast({
        title: "Error",
        description: "Failed to update message status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const updateAdminNotes = async (messageId: string) => {
    try {
      setUpdating(true);

      const { error } = await supabase
        .from('contact_messages')
        .update({
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Notes Updated",
        description: "Admin notes have been saved",
      });

      fetchMessages();
      if (selectedMessage) {
        setSelectedMessage({ ...selectedMessage, admin_notes: adminNotes });
      }
    } catch (error) {
      console.error('Error updating admin notes:', error);
      toast({
        title: "Error",
        description: "Failed to update admin notes",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed': return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in_progress': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-50 text-red-700 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'normal': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'low': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const stats = {
    total: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    inProgress: messages.filter(m => m.status === 'in_progress').length,
    resolved: messages.filter(m => m.status === 'resolved').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B38B46]"></div>
      </div>
    );
  }

  const CardStyle = "border border-[#D4B6A2]/20 shadow-sm bg-white hover:shadow-md transition-all duration-300 group";
  const LabelStyle = "text-[#7E5A34] text-xs uppercase tracking-widest font-medium";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b border-[#D4B6A2]/20 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-[#4A1C1F] tracking-tight mb-1">Contact Messages</h1>
          <p className="text-[#5C4638] font-light text-sm tracking-wide">Customer inquiries and support requests</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 border-[#D4B6A2]/30 bg-white text-[#4A1C1F] text-xs uppercase tracking-widest rounded-none focus:outline-none focus:border-[#B38B46]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#D4B6A2]/20">
            <SelectItem value="all">All Messages</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className={CardStyle}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">Total Messages</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <MessageSquare className="h-4 w-4 text-[#4A1C1F] group-hover:text-[#B38B46] transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif text-[#4A1C1F]">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className={CardStyle}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">New Messages</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <AlertCircle className="h-4 w-4 text-blue-600 group-hover:text-blue-400 transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif text-[#4A1C1F]">{stats.new}</div>
          </CardContent>
        </Card>

        <Card className={CardStyle}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">In Progress</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <Clock className="h-4 w-4 text-yellow-600 group-hover:text-yellow-400 transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif text-[#4A1C1F]">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card className={CardStyle}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7E5A34]">Resolved</CardTitle>
            <div className="p-2 bg-[#F5EFE7] rounded-full group-hover:bg-[#4A1C1F] transition-colors duration-300">
              <CheckCircle className="h-4 w-4 text-green-600 group-hover:text-green-400 transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif text-[#4A1C1F]">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-2">
          <Card className={`${CardStyle} rounded-none`}>
            <CardHeader className="border-b border-[#D4B6A2]/10 pb-4">
              <CardTitle className="font-serif text-xl text-[#4A1C1F]">Messages</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-[#D4B6A2]/20">
                    <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Customer</TableHead>
                    <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Subject</TableHead>
                    <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Status</TableHead>
                    <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Priority</TableHead>
                    <TableHead className="text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Date</TableHead>
                    <TableHead className="text-right text-xs uppercase tracking-widest text-[#7E5A34] font-medium h-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message.id} className="hover:bg-[#F9F9F7] border-[#D4B6A2]/10 transition-colors group">
                      <TableCell className="py-4">
                        <div>
                          <p className="font-medium text-[#4A1C1F] text-sm">{message.name}</p>
                          <p className="text-xs text-[#5C4638]">{message.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-[#4A1C1F] text-sm truncate max-w-xs">{message.subject}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={`rounded-none px-2 py-0.5 text-[10px] uppercase font-normal border-0 ${getStatusColor(message.status)}`}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(message.status)}
                            <span>{message.status.replace('_', ' ')}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`rounded-none px-2 py-0.5 text-[10px] uppercase font-normal border-0 ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-[#5C4638]">
                        {new Date(message.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMessage(message);
                            setAdminNotes(message.admin_notes || '');
                          }}
                          className="text-[#7E5A34] hover:text-[#4A1C1F] hover:bg-[#F9F9F7]"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Message Details */}
        <div>
          {selectedMessage ? (
            <Card className={CardStyle}>
              <CardHeader className="border-b border-[#D4B6A2]/10 pb-4">
                <CardTitle className="font-serif text-lg text-[#4A1C1F]">Message Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <Label className={LabelStyle}>Customer</Label>
                  <div className="mt-2 text-[#4A1C1F]">
                    <p className="font-medium font-serif">{selectedMessage.name}</p>
                    <p className="text-sm text-[#5C4638] flex items-center mt-1">
                      <Mail className="w-3 h-3 mr-2" />
                      {selectedMessage.email}
                    </p>
                    {selectedMessage.phone && (
                      <p className="text-sm text-[#5C4638] flex items-center mt-1">
                        <Phone className="w-3 h-3 mr-2" />
                        {selectedMessage.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className={LabelStyle}>Subject</Label>
                  <p className="mt-2 text-sm font-medium text-[#4A1C1F]">{selectedMessage.subject}</p>
                </div>

                <div>
                  <Label className={LabelStyle}>Message</Label>
                  <p className="mt-2 text-sm text-[#5C4638] bg-[#F9F9F7] p-4 rounded border border-[#D4B6A2]/20 leading-relaxed italic">
                    "{selectedMessage.message}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className={LabelStyle}>Status</Label>
                    <Select
                      value={selectedMessage.status}
                      onValueChange={(value) => updateMessageStatus(selectedMessage.id, value)}
                      disabled={updating}
                    >
                      <SelectTrigger className="mt-2 border-[#D4B6A2]/30 bg-white text-[#4A1C1F] text-xs uppercase rounded-none h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className={LabelStyle}>Priority</Label>
                    <Select
                      value={selectedMessage.priority}
                      onValueChange={(value) => updateMessageStatus(selectedMessage.id, selectedMessage.status, value)}
                      disabled={updating}
                    >
                      <SelectTrigger className="mt-2 border-[#D4B6A2]/30 bg-white text-[#4A1C1F] text-xs uppercase rounded-none h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className={LabelStyle}>Admin Notes</Label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes about this message..."
                    rows={3}
                    className="mt-2 border-[#D4B6A2]/30 focus:border-[#B38B46] bg-[#F9F9F7] text-[#4A1C1F] rounded-none"
                  />
                  <Button
                    onClick={() => updateAdminNotes(selectedMessage.id)}
                    disabled={updating}
                    size="sm"
                    className="mt-2 w-full bg-[#4A1C1F] hover:bg-[#5C4638] text-white uppercase tracking-widest text-xs rounded-none"
                  >
                    {updating ? 'Saving...' : 'Save Notes'}
                  </Button>
                </div>

                <div className="text-[10px] text-[#7E5A34] pt-4 border-t border-[#D4B6A2]/10 space-y-1">
                  <p>Created: {new Date(selectedMessage.created_at).toLocaleString()}</p>
                  <p>Updated: {new Date(selectedMessage.updated_at).toLocaleString()}</p>
                  {selectedMessage.resolved_at && (
                    <p>Resolved: {new Date(selectedMessage.resolved_at).toLocaleString()}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className={CardStyle}>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#F5EFE7] rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-6 h-6 text-[#B38B46]" />
                  </div>
                  <p className="text-[#5C4638] font-light">Select a message to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContactMessages;