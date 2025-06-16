export async function clearCart(cartItems: { id: string }[]) {
  try {
    for (const item of cartItems) {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: item.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }
    }
    return true;
  } catch (error) {
    console.error('Error clearing cart:', error);
    return false;
  }
}
