import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/api/v1/cart')
      .then(response => setCartItems(response.data))
      .catch(error => console.error('Error fetching cart:', error));
  }, []);

  const handleCheckout = () => {
    axios.post('http://localhost:3000/api/v1/checkout')
      .then(response => {
        alert('Checkout successful! Order ID: ' + response.data.order_id);
        setCartItems([]);
      })
      .catch(error => console.error('Error during checkout:', error));
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {cartItems.map(item => (
              <li key={item.id} className="border p-4 rounded shadow">
                <p>{item.name} - Quantity: {item.quantity} - ${item.price * item.quantity}</p>
              </li>
            ))}
          </ul>
          <button
            onClick={handleCheckout}
            className="mt-4 p-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Checkout
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;
