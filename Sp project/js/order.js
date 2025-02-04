// it will load all the html content and then the script with execute
document.addEventListener("DOMContentLoaded", () => {
  let totalAmount = 0;
  const orderItemsContainer = document.getElementById("orderItemsContainer");
  const totalAmountElement = document.getElementById("totalamt");
  const orderIdElement = document.getElementById("id");
  let categories = [];
  let menuItems = [];

  // Generate and display the order ID when the page loads
  const orderId = generateOrderId();
  orderIdElement.value = orderId; // Set the generated order ID in the readonly input field

  // Fetch menu data
  axios
    .get("http://localhost:3000/menu")
    .then((response) => {
      menuItems = response.data;
      categories = [...new Set(menuItems.map((item) => item.category))];
      console.log("Fetched categories:", categories);
      console.log("Fetched menu items:", menuItems);
    })
    .catch((error) => console.error("Error fetching menu:", error));

  document.getElementById("submit-btn").addEventListener("click", addOrderItem);
  document.getElementById("orderNow").addEventListener("click", submitOrder);

  function addOrderItem() {
    const row = document.createElement("div");
    row.className = "order-item-row my-3";
    row.innerHTML = `
        <div class="form-group">
          <select class="category-dropdown form-control">
            <option value="All">Select Category</option>
          </select>
        </div>
        <div class="form-group">
          <select class="item-dropdown form-control">
            <option value="">Select Item</option>
          </select>
        </div>
        <div class="form-group">
          <input type="number" placeholder="Price" class="form-control" readonly>
        </div>
        <div class="form-group">
          <input type="number" placeholder="Quantity" class="form-control" min="1" value="1">
        </div>
        <div class="form-group">
          <span class="subtotal">0</span>
        </div>
        <button class="btn remove-item-btn">Remove</button>
      `;

    const categoryDropdown = row.querySelector(".category-dropdown");
    const itemDropdown = row.querySelector(".item-dropdown");
    const priceInput = row.querySelector('input[placeholder="Price"]');
    const quantityInput = row.querySelector('input[placeholder="Quantity"]');
    const removeButton = row.querySelector(".remove-item-btn");

    populateCategoryDropdownForRow(categoryDropdown);

    categoryDropdown.addEventListener("change", function () {
      updateItemDropdown(itemDropdown, this.value);
    });

    itemDropdown.addEventListener("change", function () {
      const selectedItem = menuItems.find((item) => item.id === this.value);
      if (selectedItem) {
        priceInput.value = selectedItem.price;
        updateSubtotal.call(priceInput);
      }
    });

    quantityInput.addEventListener("input", updateSubtotal);
    removeButton.addEventListener("click", () => removeOrderItem(row));

    orderItemsContainer.appendChild(row);
  }

  function populateCategoryDropdownForRow(categoryDropdown) {
    categoryDropdown.innerHTML = '<option value="All">Select Category</option>';
    categories.forEach((category) => {
      categoryDropdown.innerHTML += `<option value="${category}">${category}</option>`;
    });
  }

  function updateItemDropdown(itemDropdown, selectedCategory) {
    itemDropdown.innerHTML = '<option value="">Select Item</option>';
    const filteredItems = menuItems.filter(
      (item) => item.category === selectedCategory || selectedCategory === "All"
    );

    if (filteredItems.length === 0) {
      itemDropdown.innerHTML = '<option value="">No items available</option>';
    }

    filteredItems.forEach((item) => {
      itemDropdown.innerHTML += `<option value="${item.id}">${item.itemName}</option>`;
    });
  }

  function updateSubtotal() {
    const row = this.closest(".order-item-row");
    const price =
      parseFloat(row.querySelector('input[placeholder="Price"]').value) || 0;
    const quantity =
      parseFloat(row.querySelector('input[placeholder="Quantity"]').value) || 0;
    const subtotal = price * quantity;
    row.querySelector(".subtotal").textContent = subtotal.toFixed(2);
    updateTotalAmount();
  }

  function updateTotalAmount() {
    const subtotals = orderItemsContainer.querySelectorAll(".subtotal");
    totalAmount = Array.from(subtotals).reduce(
      (sum, element) => sum + parseFloat(element.textContent),
      0
    );
    totalAmountElement.value = totalAmount.toFixed(2);
  }

  function removeOrderItem(row) {
    row.remove();
    updateTotalAmount();
  }

  function validateForm() {
    let isValid = true;

    // Remove previous error messages
    document.querySelectorAll(".error-message").forEach((msg) => msg.remove());

    const customerName = document.getElementById("name");
    if (!/^[a-zA-Z\s]+$/.test(customerName.value.trim())) {
      showError(customerName, "Name should only contain letters and spaces.");
      isValid = false;
    }

    const email = document.getElementById("email");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      showError(email, "Please enter a valid email address.");
      isValid = false;
    }

    const contactNumber = document.getElementById("contact");
    if (!/^\d{10}$/.test(contactNumber.value.trim())) {
      showError(contactNumber, "Contact number should be 10 digits.");
      isValid = false;
    }

    const orderDate = document.getElementById("date");
    if (!orderDate.value) {
      showError(orderDate, "Order date is required.");
      isValid = false;
    }

    const address = document.getElementById("address");
    if (address.value.trim().length < 10) {
      showError(address, "Address must be at least 10 characters long.");
      isValid = false;
    }

    return isValid;
  }

  function showError(inputElement, message) {
    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.textContent = message;
    inputElement.parentNode.insertBefore(errorElement, inputElement);
  }

  function submitOrder(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Get the current order ID (already displayed in the input field)
    const orderId = orderIdElement.value;

    const customerDetails = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      contactNumber: document.getElementById("contact").value,
      orderDate: document.getElementById("date").value,
      address: document.getElementById("address").value,
    };

    const orderData = [];
    const orderItems = orderItemsContainer.querySelectorAll(".order-item-row");

    let mainCourseCount = 0;

    orderItems.forEach((row) => {
      const itemDropdown = row.querySelector(".item-dropdown");
      const quantityInput = row.querySelector('input[placeholder="Quantity"]');
      const priceInput = row.querySelector('input[placeholder="Price"]');

      const selectedItem = menuItems.find(
        (item) => item.id === itemDropdown.value
      );
      const quantity = parseInt(quantityInput.value, 10);

      if (selectedItem && quantity > 0) {
        if (selectedItem.category.trim().toLowerCase() === "main course") {
          mainCourseCount += quantity;
        }

        orderData.push({
          itemName: selectedItem.itemName,
          category: selectedItem.category,
          price: selectedItem.price,
          quantity: quantity,
          subtotal: (selectedItem.price * quantity).toFixed(2),
        });
      }
    });

    if (orderData.length > 0) {
      // Submitting the order to the backend
      axios
        .post("http://localhost:3002/order", {
          id: orderId, // Include the generated order ID
          customerDetails, // Include customer details
          items: orderData,
          totalAmount: totalAmount.toFixed(2),
        })
        .then((response) => {
          let message = `Your order ID is: ${orderId}.\nTotal amount to be paid: INR ${totalAmount}.\n`;

          // Check if the main course count is 2 or more to apply the free soft drink message
          if (mainCourseCount >= 2) {
            message += "The order is eligible for a free soft drink!";
          }
          alert(message); // Show message with the order details
        })
        .catch((error) => {
          console.error("Error submitting order:", error);
          alert("There was an error submitting your order. Please try again.");
        });
    } else {
      alert("Please add items to your order.");
    }
  }

  // Function to generate a random order ID
  function generateOrderId() {
    return "d" + Math.floor(Math.random() * 1000000);
  }
});
