import React, { useState } from "react";
import "./AddProduct.css";
import { FaCloudUploadAlt } from "react-icons/fa";

const AddProduct = () => {
  const [image, setImage] = useState(false);
  const [productDetails, setproductDetails] = useState({
    name: "",
    description: "",
    image: "",
    category: "skincare",
    new_price: "",
    old_price: "",
  });

  const imageHandler = (e) => {
    setImage(e.target.files[0]);
  };

  const changeHandler = (e) => {
    setproductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const add_product = async () => {
    console.log(productDetails);
    let responseData;
    let product = productDetails;

    if (
      !product.name ||
      !product.description ||
      !product.new_price ||
      !product.old_price ||
      !image
    ) {
      alert("Please fill all fields and upload an image");
      return;
    }

    let formData = new FormData();
    formData.append("product", image);

    await fetch("http://localhost:4000/upload", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    })
      .then((resp) => resp.json())
      .then((data) => {
        responseData = data;
      });

    if (responseData.success) {
      product.image = responseData.image_url;
      console.log(product);
      await fetch("http://localhost:4000/addproduct", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      })
        .then((resp) => resp.json())
        .then((data) => {
          if (data.success) {
            /*  alert("Product Added");
             */
            setproductDetails({
              name: "",
              description: "",
              image: "",
              category: "skincare",
              new_price: "",
              old_price: "",
            });
            setImage(null);
            document.getElementById("file-input").value = "";
          } else {
            alert("Failed");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Request failed");
        });
    }
  };

  return (
    <div className="add-product">
      <div className="addproduct-itemfield">
        <p>Product Name</p>
        <input
          value={productDetails.name}
          onChange={changeHandler}
          type="text"
          name="name"
          placeholder="Enter product name"
        />
      </div>
      <div className="addproduct-itemfield">
        <p>Product Details</p>
        <input
          value={productDetails.description}
          onChange={changeHandler}
          type="text"
          name="description"
          placeholder="Enter product details"
        />
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Product Old Price</p>
          <input
            value={productDetails.old_price}
            onChange={changeHandler}
            type="text"
            name="old_price"
            placeholder="Enter old price"
          />
        </div>
        <div className="addproduct-itemfield">
          <p>Product New Price</p>
          <input
            value={productDetails.new_price}
            onChange={changeHandler}
            type="text"
            name="new_price"
            placeholder="Enter new price"
          />
        </div>
      </div>
      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select
          value={productDetails.category}
          onChange={changeHandler}
          name="category"
          className="add-product-selector"
        >
          <option value="skincare">Skincare</option>
          <option value="makeup">Makeup</option>
          <option value="haircare">Haircare</option>
        </select>
      </div>
      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
          {image ? (
            <img
              src={URL.createObjectURL(image)}
              alt="preview"
              className="addproduct-thumbnail-img"
            />
          ) : (
            <FaCloudUploadAlt className="addproduct-thumbnail-icon" />
          )}
          <input
            onChange={imageHandler}
            type="file"
            name="image"
            id="file-input"
            hidden
          />
        </label>
      </div>
      <button
        onClick={() => {
          add_product();
        }}
        className="addproduct-btn"
      >
        Add
      </button>
    </div>
  );
};

export default AddProduct;
