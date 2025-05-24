import { useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { completeOrder } from '../../lib/orderService';
import type { CreateOrderData, CreateOrderActions, OnApproveData, OnApproveActions } from '@paypal/paypal-js';

interface PayPalButtonProps {
  orderId: string;
  paypalOrderId: string;
  amount: string;
  onSuccess: (orderId: string, paypalOrderId: string, printfulOrderId?: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

const PayPalButton = ({ 
  orderId, 
  paypalOrderId, 
  amount, 
  onSuccess, 
  onError, 
  disabled = false 
}: PayPalButtonProps) => {
  const [{ isPending }] = usePayPalScriptReducer();
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle the approval of the payment
  const handleOnApprove = async (data: OnApproveData, actions: OnApproveActions) => {
    if (!actions.order) {
      onError('PayPal order actions not available');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Complete the order in our system
      const result = await completeOrder(orderId, data.orderID);
      
      if (result.success) {
        onSuccess(orderId, data.orderID, result.printfulOrderId);
      } else {
        onError(result.error || 'Failed to complete order');
      }
    } catch (error) {
      console.error('Error completing order:', error);
      onError(error instanceof Error ? error.message : 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle payment creation (this will use the existing PayPal order)
  const handleCreateOrder = (_data: CreateOrderData, _actions: CreateOrderActions) => {
    // Return the existing PayPal order ID that was created during checkout
    return Promise.resolve(paypalOrderId);
  };

  // Handle errors
  const handleOnError = (error: any) => {
    console.error('PayPal error:', error);
    onError('Payment failed. Please try again.');
  };

  if (isPending) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-tomato"></div>
        <span className="ml-2 text-gray-600">Loading PayPal...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {isProcessing && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center z-10 rounded-md">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-tomato"></div>
            <span className="ml-2 text-gray-700">Processing payment...</span>
          </div>
        </div>
      )}
      
      <PayPalButtons
        disabled={disabled || isProcessing}
        forceReRender={[amount, paypalOrderId]}
        createOrder={handleCreateOrder}
        onApprove={handleOnApprove}
        onError={handleOnError}
        style={{
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          height: 45,
        }}
      />
    </div>
  );
};

export default PayPalButton; 