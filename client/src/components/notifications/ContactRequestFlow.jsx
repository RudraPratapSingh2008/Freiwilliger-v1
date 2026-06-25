import React, { useState } from 'react';
import { Check, X, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

export function ContactRequestFlow({ notification, onRespond }) {
  const [isResponding, setIsResponding] = useState(false);
  const [responseStatus, setResponseStatus] = useState(null); // 'approved' or 'denied'

  // If this is not a contact request notification or it's malformed, return null
  if (!notification || !notification.requestId) return null;

  const {
    requestId,
    organiserName,
    eventName,
    reason,
    details
  } = notification;

  const handleResponse = async (status) => {
    try {
      setIsResponding(true);
      // Let the parent component/hook handle the API call
      // The status sent to backend should be 'approved_by_volunteer' or 'denied_by_volunteer'
      await onRespond(requestId, status === 'approve' ? 'approved_by_volunteer' : 'denied_by_volunteer');
      setResponseStatus(status);
    } catch (error) {
      console.error('Failed to respond to contact request', error);
      // Re-enable buttons if failed
      setIsResponding(false);
    }
  };

  if (responseStatus === 'approve') {
    return (
      <Card className="bg-emerald-50 border-emerald-100">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="bg-emerald-100 p-2 rounded-full">
            <Check className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-900">Request Approved</p>
            <p className="text-xs text-emerald-700">
              {organiserName} can now view your contact details.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (responseStatus === 'deny') {
    return (
      <Card className="bg-slate-50 border-slate-100">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="bg-slate-200 p-2 rounded-full">
            <X className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Request Denied</p>
            <p className="text-xs text-slate-500">
              Your contact details remain hidden from {organiserName}.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border shadow-sm">
      <div className="bg-blue-50/50 p-4 border-b">
        <div className="flex items-center gap-2 text-blue-800 mb-1">
          <Mail className="w-4 h-4" />
          <h3 className="font-semibold text-sm">Contact Details Request</h3>
        </div>
        <p className="text-xs text-slate-600">
          <span className="font-medium text-slate-900">{organiserName}</span> has requested to view your email and phone number for <span className="font-medium">{eventName}</span>.
        </p>
      </div>
      
      <CardContent className="p-4 space-y-4">
        <div className="bg-slate-50 rounded-md p-3 text-sm space-y-2">
          <div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Reason</span>
            <p className="font-medium text-slate-900">{reason}</p>
          </div>
          {details && (
            <div>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Details</span>
              <p className="text-slate-700 mt-0.5">{details}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            onClick={() => handleResponse('deny')}
            disabled={isResponding}
          >
            <X className="w-4 h-4 mr-2" />
            Deny
          </Button>
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => handleResponse('approve')}
            disabled={isResponding}
          >
            <Check className="w-4 h-4 mr-2" />
            Approve
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
