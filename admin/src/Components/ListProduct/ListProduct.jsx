import React, { useEffect, useState } from "react";
import "./ListProduct.css";
import { RiCloseLargeFill } from "react-icons/ri";

const ListProduct = () => {
  const [allProducts, setAllProducts] = useState([]);

  const fetchInfo = async () => {
    await fetch("http://localhost:4000/allproducts")
      .then((resp) => resp.json())
      .then((data) => {
        setAllProducts(data);
      });
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const removeProduct = async (id) => {
    await fetch("http://localhost:4000/removeproduct", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    })
      .then((resp) => resp.json())
      .then((data) => {
        if (data.success) {
          /* alert("Product removed"); */
          fetchInfo();
        } else {
          alert("Failed to remove");
        }
      })
      .catch((err) => {
        console.error("Delete failed:", err);
        alert("Error deleting product");
      });
  };

  return (
    <div className="list-product">
      <h1>All Products</h1>
      <div className="listproduct-format-main">
        <p>Product</p>
        <p>Name</p>
        <p>Description</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allProducts.length === 0 ? (
          <p>No products found</p>
        ) : (
          allProducts.map((product, index) => (
            <>
              <div
                key={index}
                className="listproduct-format-main listproduct-format"
              >
                <img
                  src={product.image}
                  alt=""
                  className="listproduct-product-icon"
                />
                <p>{product.name}</p>
                <p>{product.description}</p>
                <p>Ghc {parseFloat(product.old_price).toFixed(2)}</p>
                <p>Ghc {parseFloat(product.new_price).toFixed(2)}</p>
                <p>{product.category}</p>
                <RiCloseLargeFill
                  className="listproduct-remove-icon"
                  onClick={() => removeProduct(product.id)}
                />
              </div>
              <hr />
            </>
          ))
        )}
      </div>
    </div>
  );
};

export default ListProduct;
