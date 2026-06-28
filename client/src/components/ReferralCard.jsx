import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Copy, Check } from 'lucide-react';
import axios from '../lib/axios';

export default function ReferralCard() {
  const [referralData, setReferralData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    axios
      .get('/users/me/referral')
      .then(({ data }) => setReferralData(data.data))
      .catch(() => {});
  }, []);

  const copyLink = () => {
    if (referralData?.shareUrl) {
      navigator.clipboard.writeText(referralData.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!referralData) return null;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Gift className="h-5 w-5 text-violet-600" />
        <h3 className="font-semibold text-sm">Invite Friends</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Share your referral link and grow the community
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs bg-muted px-3 py-2 rounded truncate">
          {referralData.referralCode}
        </code>
        <Button size="sm" variant="outline" onClick={copyLink}>
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {referralData.referralCount} people joined via your link
      </p>
    </Card>
  );
}
