import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import '../styles/StripeCheckout.css';

// Inicializar Stripe
let stripePromise = null;

const getStripePromise = async () => {
  if (!stripePromise) {
    try {
      const response = await fetch('/api/stripe/config');
      const { publishableKey } = await response.json();
      stripePromise = loadStripe(publishableKey);
    } catch (error) {
      console.error('Error loading Stripe config:', error);
    }
  }
  return stripePromise;
};

const PaymentForm = ({ clientSecret, onSuccess, onError, total }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message);
        onError(error.message);
        setProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      setErrorMessage('Error al procesar el pago');
      onError('Error al procesar el pago');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-payment-form">
      <div className="payment-element-container">
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="error-message">{errorMessage}</div>
      )}

      <div className="payment-total">
        <span>Total a pagar:</span>
        <span className="total-amount">€{total.toFixed(2)}</span>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="submit-payment-btn"
      >
        {processing ? 'Procesando...' : `Pagar €${total.toFixed(2)}`}
      </button>

      <div className="stripe-secure-badge">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Pago seguro con Stripe
      </div>
    </form>
  );
};

const StripeCheckout = ({ amount, onSuccess, onError }) => {
  const [clientSecret, setClientSecret] = useState(null);
  const [stripePromiseLoaded, setStripePromiseLoaded] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        // Cargar Stripe
        const stripe = await getStripePromise();
        setStripePromiseLoaded(stripe);

        // Crear Payment Intent
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount }),
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error initializing payment:', error);
        onError('Error al inicializar el pago');
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, [amount, onError]);

  if (loading || !clientSecret || !stripePromiseLoaded) {
    return (
      <div className="stripe-loading">
        <div className="loading-spinner"></div>
        <p>Preparando método de pago...</p>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#000000',
        colorBackground: '#ffffff',
        colorText: '#000000',
        colorDanger: '#df1b41',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '10px',
      },
    },
  };

  return (
    <div className="stripe-checkout-container">
      <Elements stripe={stripePromiseLoaded} options={options}>
        <PaymentForm
          clientSecret={clientSecret}
          onSuccess={onSuccess}
          onError={onError}
          total={amount}
        />
      </Elements>
    </div>
  );
};

export default StripeCheckout;
