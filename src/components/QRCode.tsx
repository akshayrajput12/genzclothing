import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QrCode, Download, Share2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeComponentProps {
  size?: number;
  showDialog?: boolean;
  className?: string;
}

const QRCodeComponent: React.FC<QRCodeComponentProps> = ({ 
  size = 200, 
  showDialog = true,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
  // Get website URL from environment variables and append /products
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://www.daretodiet.fit/';
  const websiteUrl = baseUrl.endsWith('/') ? `${baseUrl}products` : `${baseUrl}/products`;
  const appName = import.meta.env.VITE_APP_NAME || 'Dare To Diet';

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(websiteUrl);
      toast({
        title: "URL Copied!",
        description: "Website URL has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${appName}-qr-code.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Visit ${appName}`,
          text: `Check out ${appName} - Your bulk buying destination!`,
          url: websiteUrl,
        });
      } catch (error) {
        // Fallback to copy URL if sharing fails
        handleCopyUrl();
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopyUrl();
    }
  };

  const QRCodeDisplay = () => (
    <div className="flex flex-col items-center space-y-4">
      <div className="p-4 bg-white rounded-lg shadow-sm border">
        <QRCode
          id="qr-code-svg"
          size={size}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          value={websiteUrl}
          viewBox="0 0 256 256"
        />
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">
          Scan to visit {appName}
        </p>
        <p className="text-xs text-gray-500 break-all max-w-xs">
          {websiteUrl}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyUrl}
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy URL
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadQR}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download QR
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>
    </div>
  );

  if (!showDialog) {
    return (
      <div className={className}>
        <QRCodeDisplay />
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <QrCode className="h-4 w-4" />
          QR Code
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            {appName} QR Code
          </DialogTitle>
          <DialogDescription>
            Scan this QR code with your phone to quickly access our website
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center py-4">
          <QRCodeDisplay />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeComponent;