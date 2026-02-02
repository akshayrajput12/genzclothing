/**
 * Invoice generation utilities for Dare To Diet
 * Generates beautiful PDF invoices for orders
 */

interface InvoiceData {
    invoice_number: string;
    order_number: string;
    invoice_date: string;
    due_date: string;
    order_date: string;
    store_info: {
        store_name: string;
        store_address: string;
        store_phone: string;
        store_email: string;
        currency_symbol: string;
    };
    customer_info: {
        name: string;
        email: string;
        phone: string;
    };
    delivery_address: {
        plotNumber?: string;
        buildingName?: string;
        street?: string;
        landmark?: string;
        pincode?: string;
        complete_address?: string;
        // Location fields removed - manual address entry only
    };
    items: any[];
    pricing: {
        subtotal: number;
        tax: number;
        delivery_fee: number;
        cod_fee: number;
        discount: number;
        total: number;
    };
    payment_info: {
        method: string;
        status: string;
        razorpay_payment_id?: string;
    };
    order_status: string;
    coupon_code?: string;
    special_instructions?: string;
}

// Generate HTML invoice template
export function generateInvoiceHTML(data: InvoiceData): string {
    const {
        invoice_number,
        order_number,
        invoice_date,
        due_date,
        order_date,
        store_info,
        customer_info,
        delivery_address,
        items,
        pricing,
        payment_info,
        order_status,
        coupon_code,
        special_instructions
    } = data;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoice_number}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        @page {
            margin: 0.3cm;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: #F9F9F7;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            box-shadow: none;
            border-radius: 0;
            overflow: hidden;
        }
        
        .invoice-header {
            background: #ffffff;
            color: #1a1a1a;
            padding: 20px;
            border-bottom: 3px solid #1a1a1a;
        }
        
        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .logo-container {
            display: flex;
            align-items: center;
        }
        
        .company-logo {
            width: 40px;
            height: 40px;
            margin-right: 10px;
        }
        
        .company-name {
            font-size: 1.3rem;
            font-weight: 700;
            color: #4A1C1F;
            margin: 0;
        }
        
        .invoice-badge {
            background: #1a1a1a;
            color: white;
            padding: 3px 10px;
            border-radius: 0;
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .invoice-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }
        
        .invoice-body {
            padding: 15px 20px;
        }
        
        .invoice-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
            page-break-inside: avoid;
        }
        
        .info-section h3 {
            color: #4A1C1F;
            margin-bottom: 10px;
            font-size: 1rem;
            font-weight: 600;
            position: relative;
            padding-bottom: 5px;
        }
        
        .info-section h3::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 30px;
            height: 2px;
            background: #1a1a1a;
            border-radius: 0;
        }
        
        .info-section p {
            margin-bottom: 5px;
            color: #5C4638;
            font-size: 0.9rem;
        }
        
        .info-section strong {
            color: #4A1C1F;
            font-weight: 500;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 0.8rem;
            page-break-inside: avoid;
        }
        
        .items-table th {
            background: #F9F9F7;
            color: #1a1a1a;
            padding: 12px 10px;
            text-align: left;
            font-weight: 600;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 2px solid #1a1a1a;
        }
        
        .items-table td {
            padding: 6px 6px;
            border-bottom: 1px solid #D4B6A2;
        }
        
        .items-table tr:last-child td {
            border-bottom: none;
        }
        
        .items-table tr:hover {
            background: #fdf6f3;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        .pricing-summary {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
            page-break-inside: avoid;
        }
        
        .pricing-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            padding: 2px 0;
        }
        
        .pricing-row.total {
            border-top: 2px solid #eee;
            padding-top: 8px;
            margin-top: 8px;
            font-weight: 700;
            font-size: 1.1rem;
            color: #2d2d2d;
        }
        
        .status-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-paid {
            background: #e8f5e9;
            color: #2e7d32;
        }
        
        .status-pending {
            background: #fff8e1;
            color: #f57f17;
        }
        
        .status-delivered {
            background: #e3f2fd;
            color: #1565c0;
        }
        
        .status-cancelled {
            background: #ffebee;
            color: #c62828;
        }
        
        .status-placed {
            background: #e1f5fe;
            color: #0288d1;
        }
        
        .status-confirmed {
            background: #e8f5e8;
            color: #388e3c;
        }
        
        .invoice-footer {
            background: #f8f9fa;
            padding: 10px 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #eee;
            font-size: 0.8rem;
        }
        
        .invoice-footer p {
            margin-bottom: 5px;
            font-size: 0.8rem;
        }
        
        .company-details {
            font-size: 0.7rem;
            color: #888;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid #eee;
        }
        
        @media print {
            body {
                background: white;
                margin: 0;
                padding: 0;
                font-size: 11px;
            }
            
            .invoice-container {
                box-shadow: none;
                margin: 0;
                border-radius: 0;
                max-width: 100%;
            }
            
            .items-table {
                font-size: 0.7rem;
            }
            
            .items-table th,
            .items-table td {
                padding: 3px 4px;
            }
            
            .pricing-row {
                margin-bottom: 5px;
            }
            
            .info-section p {
                margin-bottom: 2px;
            }
            
            .company-name {
                font-size: 1.2rem;
            }
            
            h3 {
                font-size: 0.85rem;
            }
            
            .invoice-footer {
                padding: 8px 15px;
                font-size: 0.75rem;
            }
            
            .company-details {
                font-size: 0.65rem;
                margin-top: 5px;
                padding-top: 5px;
            }
        }
        
        @media (max-width: 600px) {
            .invoice-info {
                grid-template-columns: 1fr;
                gap: 15px;
            }
            
            .items-table {
                font-size: 0.8rem;
            }
            
            .items-table th,
            .items-table td {
                padding: 6px 5px;
            }
            
            .header-top {
                flex-direction: column;
                gap: 10px;
                align-items: flex-start;
            }
            
            .invoice-details {
                grid-template-columns: 1fr;
                gap: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header -->
        <div class="invoice-header">
            <div class="header-top">
                <div class="logo-container">
            
                    <h1 class="company-name">${store_info.store_name}</h1>
                </div>
                <div class="invoice-badge">Tax Invoice</div>
            </div>
            
            <div class="invoice-details">
                <div>
                    <p><strong>Invoice Number:</strong> ${invoice_number}</p>
                    <p><strong>Order Number:</strong> ${order_number}</p>
                    <p><strong>Invoice Date:</strong> ${invoice_date}</p>
                </div>
                <div>
                    <p><strong>Due Date:</strong> ${due_date}</p>
                    <p><strong>Order Date:</strong> ${order_date}</p>
                </div>
            </div>
        </div>
        
        <!-- Body -->
        <div class="invoice-body">
            <!-- Customer & Company Info -->
            <div class="invoice-info">
                <div class="info-section">
                    <h3>Bill To</h3>
                    <p><strong>${customer_info.name}</strong></p>
                    <p><strong>Email:</strong> ${customer_info.email}</p>
                    <p><strong>Phone:</strong> ${customer_info.phone}</p>
                </div>
                
                <div class="info-section">
                    <h3>Company Details</h3>
                    <p><strong>${store_info.store_name}</strong></p>
                    <p>${store_info.store_address}</p>
                    <p><strong>Phone:</strong> ${store_info.store_phone}</p>
                    <p><strong>Email:</strong> ${store_info.store_email}</p>
                </div>
            </div>
            
            <!-- Delivery Address -->
            <div class="info-section">
                <h3>Delivery Address</h3>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 4px; margin-top: 8px; font-size: 0.85rem;">
                    <p style="margin: 0 0 5px 0;"><strong>Address:</strong> ${delivery_address.plotNumber || ''} ${delivery_address.buildingName || ''}, ${delivery_address.street || ''}</p>
                    ${delivery_address.landmark ? `<p style="margin: 0 0 5px 0;"><strong>Near:</strong> ${delivery_address.landmark}</p>` : ''}
                    <p style="margin: 0;"><strong>Pincode:</strong> ${delivery_address.pincode || ''}</p>
                    ${delivery_address.complete_address ? `
                    <p style="margin: 5px 0 0 0; font-style: italic;">${delivery_address.complete_address}</p>
                    ` : ''}
                </div>
            </div>
            
            <!-- Items Table -->
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Weight/Qty</th>
                        <th class="text-center">Quantity</th>
                        <th class="text-right">Unit Price</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.slice(0, 10).map(item => `
                        <tr>
                            <td>
                                <strong>${item.name}</strong>
                                ${item.category ? `<br><small style="color: #666;">${item.category}</small>` : ''}
                                ${item.selected_size ? `<br><small style="color: #666;">Size: ${item.selected_size}</small>` : ''}
                            </td>
                            <td>${item.weight || item.pieces || 'N/A'}</td>
                            <td class="text-center">${item.quantity}</td>
                            <td class="text-right">${store_info.currency_symbol}${item.price.toFixed(2)}</td>
                            <td class="text-right"><strong>${store_info.currency_symbol}${(item.price * item.quantity).toFixed(2)}</strong></td>
                        </tr>
                    `).join('')}
                    ${items.length > 10 ? `
                        <tr>
                            <td colspan="5" style="text-align: center; font-style: italic; padding: 10px;">
                                Showing 10 of ${items.length} items - See website for complete order details
                            </td>
                        </tr>
                    ` : ''}
                </tbody>
            </table>
            
            <!-- Pricing Summary -->
            <div class="pricing-summary">
                <div class="pricing-row">
                    <span>Subtotal:</span>
                    <span>${store_info.currency_symbol}${pricing.subtotal.toFixed(2)}</span>
                </div>
                
                <div class="pricing-row">
                    <span>Tax (GST):</span>
                    <span>${store_info.currency_symbol}${pricing.tax.toFixed(2)}</span>
                </div>
                
                <div class="pricing-row">
                    <span>Delivery Fee:</span>
                    <span>${pricing.delivery_fee > 0 ? store_info.currency_symbol + pricing.delivery_fee.toFixed(2) : 'FREE'}</span>
                </div>
                
                ${pricing.cod_fee > 0 ? `
                <div class="pricing-row">
                    <span>COD Fee:</span>
                    <span>${store_info.currency_symbol}${pricing.cod_fee.toFixed(2)}</span>
                </div>
                ` : ''}
                
                ${pricing.discount > 0 ? `
                <div class="pricing-row" style="color: #2e7d32;">
                    <span>Discount ${coupon_code ? `(${coupon_code})` : ''}:</span>
                    <span>-${store_info.currency_symbol}${pricing.discount.toFixed(2)}</span>
                </div>
                ` : ''}
                
                <div class="pricing-row total">
                    <span>Total Amount:</span>
                    <span>${store_info.currency_symbol}${pricing.total.toFixed(2)}</span>
                </div>
            </div>
            
            <!-- Payment & Status Info -->
            <div class="invoice-info">
                <div class="info-section">
                    <h3>Payment Information</h3>
                    <p><strong>Payment Method:</strong> ${payment_info.method.toUpperCase()}</p>
                    <p><strong>Payment Status:</strong> <span class="status-badge status-${payment_info.status}">${payment_info.status}</span></p>
                    ${payment_info.razorpay_payment_id ? `<p><strong>Transaction ID:</strong> ${payment_info.razorpay_payment_id}</p>` : ''}
                </div>
                
                <div class="info-section">
                    <h3>Order Status</h3>
                    <p><span class="status-badge status-${order_status}">${order_status}</span></p>
                    ${special_instructions ? `<p><strong>Special Instructions:</strong><br>${special_instructions}</p>` : ''}
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="invoice-footer">
            <p><strong>Thank you for choosing ${store_info.store_name}!</strong></p>
            <p>For any queries regarding this invoice, please contact us at ${store_info.store_email}</p>
            
            <div class="company-details">
                <p>This is a computer-generated invoice and does not require a physical signature.</p>
                <p>CIN: U12345MH2024PTC123456 | FSSAI: 12345678901234</p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

// Generate and download PDF invoice
export async function downloadInvoice(invoiceData: InvoiceData): Promise<void> {
    try {
        // Generate HTML content
        const htmlContent = generateInvoiceHTML(invoiceData);

        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            throw new Error('Unable to open print window. Please allow popups.');
        }

        // Write HTML content to the new window
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Wait for content to load, then trigger print
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
                // Close the window after printing (optional)
                // printWindow.close();
            }, 500);
        };

    } catch (error) {
        console.error('Error generating invoice:', error);
        throw new Error('Failed to generate invoice. Please try again.');
    }
}

// Alternative method using HTML5 download
export function downloadInvoiceHTML(invoiceData: InvoiceData): void {
    const htmlContent = generateInvoiceHTML(invoiceData);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoiceData.invoice_number}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

// Format currency for display
export function formatCurrency(amount: number, symbol: string = '₹'): string {
    return `${symbol}${amount.toFixed(2)}`;
}

// Validate invoice data
export function validateInvoiceData(data: any): data is InvoiceData {
    return (
        data &&
        data.invoice_number &&
        data.order_number &&
        data.store_info &&
        data.customer_info &&
        data.items &&
        Array.isArray(data.items) &&
        data.pricing
    );
}