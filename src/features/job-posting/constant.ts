import React from 'react';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export const getStatusIcon = (status: string) => {
    switch (status) {
        case 'active': return React.createElement(CheckCircle, { className: "w-4 h-4 text-green-500" });
        case 'draft': return React.createElement(AlertCircle, { className: "w-4 h-4 text-yellow-500" });
        case 'closed': return React.createElement(XCircle, { className: "w-4 h-4 text-red-500" });
        default: return null;
    }
};
