import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ReadReceipt({ status, className }) {
  // status: 'sent' | 'delivered' | 'read'
  const getColor = () => {
    switch (status) {
      case 'read':
        return 'text-indigo-600';
      case 'delivered':
        return 'text-gray-500';
      case 'sent':
      default:
        return 'text-gray-400';
    }
  };

  const getIcon = () => {
    if (status === 'read') {
      return (
        <div className="flex gap-0.5">
          <Check size={14} />
          <Check size={14} className="-ml-2" />
        </div>
      );
    }
    return <Check size={14} />;
  };

  return (
    <div className={cn('flex items-center', getColor(), className)}>
      {getIcon()}
    </div>
  );
}
