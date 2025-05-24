import { useState } from 'react';
import { syncPrintfulProducts } from '../../lib/printful';

interface PrintfulSyncProps {
  onSyncComplete?: (success: boolean) => void;
}

const PrintfulSync = ({ onSyncComplete }: PrintfulSyncProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    
    try {
      const success = await syncPrintfulProducts();
      
      setSyncResult({
        success,
        message: success 
          ? 'Printful products successfully synced with your store.' 
          : 'Failed to sync Printful products. Please check the console for errors.'
      });
      
      if (onSyncComplete) {
        onSyncComplete(success);
      }
    } catch (error) {
      console.error('Error syncing Printful products:', error);
      setSyncResult({
        success: false,
        message: 'An error occurred while syncing products.'
      });
      
      if (onSyncComplete) {
        onSyncComplete(false);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Printful Sync</h3>
      
      <p className="mb-4 text-gray-600 dark:text-gray-300">
        Sync your Printful products with your store. This will update existing products and add new ones.
      </p>
      
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="px-4 py-2 rounded-md font-medium transition-colors"
        style={{ 
          backgroundColor: isSyncing ? 'var(--secondary-color)' : 'var(--primary-color)',
          color: 'white',
          opacity: isSyncing ? 0.7 : 1
        }}
      >
        {isSyncing ? 'Syncing...' : 'Sync Printful Products'}
      </button>
      
      {syncResult && (
        <div 
          className={`mt-4 p-3 rounded-md ${
            syncResult.success 
              ? 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100' 
              : 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-100'
          }`}
        >
          {syncResult.message}
        </div>
      )}
    </div>
  );
};

export default PrintfulSync; 