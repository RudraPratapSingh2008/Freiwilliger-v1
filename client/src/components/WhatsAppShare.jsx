import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WhatsAppShare({ event }) {
  const shareUrl = `${window.location.origin}/events/${event._id}`;
  const text = `Check out this volunteer event on Freiwilliger: "${event.eventName}" in ${event.location?.city || 'your area'}. ${shareUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 text-green-600 border-green-200 hover:bg-green-50"
      onClick={() => window.open(whatsappUrl, '_blank')}
    >
      <MessageCircle className="h-4 w-4" />
      Share on WhatsApp
    </Button>
  );
}
