import React from 'react';
import { X, Download, Package, MapPin, CreditCard, Calendar, Phone, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/utils/currency';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  weight: string;
  category: string;
}

interface GuestOrderData {
  orderNumber: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  codFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress: {
    plotNumber: string;
    buildingName?: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  orderDate: string;
  couponCode?: string;
}

interface GuestOrderPopupProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: GuestOrderData;
}

const GuestOrderPopup: React.FC<GuestOrderPopupProps> = ({ isOpen, onClose, orderData }) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Paridhan Haat', 20, 25);

    doc.setFontSize(16);
    doc.text('Order Receipt', 20, 40);

    // Order Info
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(`Order #: ${orderData.orderNumber}`, 20, 55);
    doc.text(`Date: ${formatDate(orderData.orderDate)}`, 20, 65);
    doc.text(`Payment: ${orderData.paymentMethod.toUpperCase()}`, 20, 75);

    // Customer Info
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Customer Information', 20, 95);
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Name: ${orderData.customerInfo.name}`, 20, 105);
    doc.text(`Email: ${orderData.customerInfo.email}`, 20, 115);
    doc.text(`Phone: ${orderData.customerInfo.phone}`, 20, 125);

    // Delivery Address
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Delivery Address', 20, 145);
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const address = `${orderData.deliveryAddress.plotNumber}${orderData.deliveryAddress.buildingName ? ', ' + orderData.deliveryAddress.buildingName : ''}, ${orderData.deliveryAddress.street}${orderData.deliveryAddress.landmark ? ', Near ' + orderData.deliveryAddress.landmark : ''}, ${orderData.deliveryAddress.city}, ${orderData.deliveryAddress.state} - ${orderData.deliveryAddress.pincode}`;
    const splitAddress = doc.splitTextToSize(address, pageWidth - 40);
    doc.text(splitAddress, 20, 155);

    // Items Table
    const tableData = orderData.items.map(item => [
      item.name,
      item.weight,
      item.quantity.toString(),
      `₹${item.price.toFixed(2)}`,
      `₹${(item.price * item.quantity).toFixed(2)}`
    ]);

    (doc as any).autoTable({
      head: [['Item', 'Weight', 'Qty', 'Price', 'Total']],
      body: tableData,
      startY: 180,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
      styles: { fontSize: 9 }
    });

    // Bill Summary
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Bill Summary', 20, finalY);

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    let summaryY = finalY + 15;
    doc.text(`Subtotal: ₹${orderData.subtotal.toFixed(2)}`, 20, summaryY);
    summaryY += 10;
    doc.text(`Tax: ₹${orderData.tax.toFixed(2)}`, 20, summaryY);
    summaryY += 10;
    doc.text(`Delivery Fee: ${orderData.deliveryFee === 0 ? 'FREE' : '₹' + orderData.deliveryFee.toFixed(2)}`, 20, summaryY);

    if (orderData.codFee > 0) {
      summaryY += 10;
      doc.text(`COD Fee: ₹${orderData.codFee.toFixed(2)}`, 20, summaryY);
    }

    if (orderData.discount > 0) {
      summaryY += 10;
      doc.setTextColor(0, 150, 0);
      doc.text(`Discount: -₹${orderData.discount.toFixed(2)}`, 20, summaryY);
      doc.setTextColor(80, 80, 80);
    }

    summaryY += 15;
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(`Total Amount: ₹${orderData.total.toFixed(2)}`, 20, summaryY);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('Thank you for shopping with Paridhan Haat!', 20, doc.internal.pageSize.height - 20);
    doc.text('For support, contact us at content@paridhanhaat.com', 20, doc.internal.pageSize.height - 10);

    // Save PDF
    doc.save(`Order_${orderData.orderNumber}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-green-600">Order Placed Successfully!</h2>
            <p className="text-gray-600 mt-1">Order #{orderData.orderNumber}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={generatePDF}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-amber-600 text-lg">⚠️</div>
              <div>
                <h3 className="font-semibold text-amber-800 mb-2">Important Notice</h3>
                <p className="text-amber-700 text-sm mb-2">
                  Since you placed this order as a guest, you won't be able to view these details again after closing this window.
                </p>
                <p className="text-amber-700 text-sm font-medium">
                  Please download the PDF receipt for your records or take a screenshot of this page.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Order Date</span>
                  <span className="font-medium">{formatDate(orderData.orderDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment Method</span>
                  <span className="font-medium uppercase">{orderData.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment Status</span>
                  <Badge className={getStatusColor(orderData.paymentStatus)}>
                    {orderData.paymentStatus}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Items</span>
                  <span className="font-medium">{orderData.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-green-600">{formatPrice(orderData.total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Customer & Delivery Info */}
            <div className="space-y-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{orderData.customerInfo.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{orderData.customerInfo.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{orderData.customerInfo.phone}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{orderData.customerInfo.name}</p>
                    <p className="text-sm text-gray-600">
                      {orderData.deliveryAddress.plotNumber}
                      {orderData.deliveryAddress.buildingName && `, ${orderData.deliveryAddress.buildingName}`}
                    </p>
                    <p className="text-sm text-gray-600">{orderData.deliveryAddress.street}</p>
                    <p className="text-sm text-gray-600">
                      {orderData.deliveryAddress.city}, {orderData.deliveryAddress.state} - {orderData.deliveryAddress.pincode}
                    </p>
                    {orderData.deliveryAddress.landmark && (
                      <p className="text-sm text-gray-500">
                        Near {orderData.deliveryAddress.landmark}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img
                      src={item.image || '/api/placeholder/64/64'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/api/placeholder/64/64';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.weight}</p>
                      <p className="text-xs text-gray-500 capitalize">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.price} × {item.quantity}</p>
                      <p className="text-sm text-gray-600">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Bill Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Subtotal</span>
                  <span className="text-sm">₹{orderData.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tax</span>
                  <span className="text-sm">₹{orderData.tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Delivery Fee</span>
                  <span className="text-sm">
                    {orderData.deliveryFee === 0 ? (
                      <span className="text-green-600 font-medium">Will be calulated</span>
                    ) : (
                      `₹${orderData.deliveryFee.toLocaleString('en-IN')}`
                    )}
                  </span>
                </div>
                {orderData.codFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">COD Fee</span>
                    <span className="text-sm">₹{orderData.codFee.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {orderData.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="text-sm">
                      Discount {orderData.couponCode && (
                        <span className="font-medium">({orderData.couponCode})</span>
                      )}
                    </span>
                    <span className="text-sm font-medium">-₹{orderData.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total Amount</span>
                  <span className="text-green-600">₹{orderData.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              onClick={generatePDF}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF Receipt
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
          </div>

          {/* Sign Up Suggestion */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-blue-600 text-lg">💡</div>
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Want to track your orders?</h3>
                <p className="text-blue-700 text-sm mb-3">
                  Create an account to track your orders, save addresses, and get exclusive offers.
                </p>
                <Button
                  onClick={() => {
                    onClose();
                    window.location.href = '/auth';
                  }}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestOrderPopup;
