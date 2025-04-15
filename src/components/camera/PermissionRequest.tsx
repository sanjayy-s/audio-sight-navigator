
import React from 'react';
import { Button } from '@/components/ui/button';

interface PermissionRequestProps {
  onRequestPermission: () => void;
}

const PermissionRequest: React.FC<PermissionRequestProps> = ({ onRequestPermission }) => {
  return (
    <div className="bg-destructive/10 p-4 rounded-md mb-4 text-center">
      <p className="text-destructive font-medium">
        Camera access is required for this app to function.
        Please enable camera permissions and refresh the page.
      </p>
      <Button 
        onClick={onRequestPermission}
        className="mt-2"
      >
        Request Camera Access
      </Button>
    </div>
  );
};

export default PermissionRequest;
