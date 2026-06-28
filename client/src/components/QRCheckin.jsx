import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QrCode } from 'lucide-react';
import axios from '../lib/axios';

export function QRCodeGenerator({ eventId }) {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateQR = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/events/${eventId}/checkin-qr`);
      setQrData(JSON.stringify({ eventId, token: data.data.token }));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <Card className="p-6 text-center space-y-4">
      <QrCode className="h-8 w-8 mx-auto text-primary" />
      <h3 className="font-semibold">Event Check-In QR Code</h3>
      {qrData ? (
        <QRCodeSVG value={qrData} size={200} className="mx-auto" />
      ) : (
        <Button onClick={generateQR} disabled={loading}>
          {loading ? 'Generating...' : 'Generate QR Code'}
        </Button>
      )}
      <p className="text-xs text-muted-foreground">
        Show this to volunteers at the event for instant check-in
      </p>
    </Card>
  );
}
