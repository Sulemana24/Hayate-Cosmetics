import React, { useContext, useState } from "react";
import "./CartItems.css";
import { ShopContext } from "../../Context/ShopContext";
import remove_icon from "../Assets/cart_cross_icon.png";

const CartItems = () => {
  const {
    getTotalCartAmount,
    all_product,
    cartItems,
    removeFromCart,
    addToCart,
  } = useContext(ShopContext);

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const handlePromoSubmit = () => {
    if (promoCode === "DISCOUNT10") {
      setDiscount(0.1);
    } else {
      setDiscount(0);
      alert("Invalid promo code");
    }
  };

  const total = getTotalCartAmount();
  const discountedTotal = total - total * discount;
  const isCartEmpty = Object.values(cartItems).every((qty) => qty === 0);

  return (
    <div className="cartitems">
      {isCartEmpty ? (
        <div className="empty-cart-message">
          <h2>Your cart is empty.</h2>
          <p>Browse our products and add items to your cart.</p>
        </div>
      ) : (
        <>
          <div className="cartitems-format-main1">
            <p>Product</p>
            <p>Title</p>
            <p>Price</p>
            <p>Quantity</p>
            <p>Total</p>
            <p>Remove</p>
          </div>
          <hr />
          {all_product.map((e) => {
            if (cartItems[e.id] > 0) {
              return (
                <div key={e.id}>
                  <div className="cartitem-format cartitems-format-main">
                    <img
                      src={e.image}
                      alt=""
                      className="carticon-product-icon"
                    />
                    <p>{e.name}</p>
                    <p>Ghc{e.new_price}</p>
                    <div className="cartitem-quantity-controls">
                      <button onClick={() => removeFromCart(e.id)}>-</button>
                      <span>{cartItems[e.id]}</span>
                      <button onClick={() => addToCart(e.id)}>+</button>
                    </div>
                    <p>Ghc{(e.new_price * cartItems[e.id]).toFixed(2)}</p>
                    <img
                      className="cartitems-remove-icon"
                      src={remove_icon}
                      onClick={() => removeFromCart(e.id)}
                      alt="remove"
                    />
                  </div>
                  <hr />
                </div>
              );
            }
            return null;
          })}

          <div className="cartitems-down">
            <div className="cartitems-promocode">
              <p>If you have a promo code, enter it here</p>
              <div className="cartitems-promobox">
                <input
                  type="text"
                  placeholder="promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button onClick={handlePromoSubmit}>Submit</button>
              </div>
              {discount > 0 && (
                <p style={{ color: "green", fontWeight: "bold" }}>
                  Promo code applied: -{(discount * 100).toFixed(0)}%
                </p>
              )}
            </div>

            <div className="cartitems-total">
              <h1>Cart Totals</h1>
              <div>
                <div className="cartitems-total-item">
                  <p>Subtotal</p>
                  <p>Ghc{total.toFixed(2)}</p>
                </div>
                <hr />
                <div className="cartitems-total-item">
                  <p>Shipping Fee</p>
                  <p>Free</p>
                </div>
                <hr />
                <div className="cartitems-total-item">
                  <h3>Total</h3>
                  <h3>Ghc{discountedTotal.toFixed(2)}</h3>
                </div>
              </div>
              <button>PROCEED TO CHECKOUT</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartItems;
