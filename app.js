/* =====================================================
   BANANA PYP MINI APP
   MAIN JAVASCRIPT
===================================================== */


/* =====================================================
   1. CONFIGURATION
===================================================== */

// 🔴 จุดที่เราจะใส่ LIFF ID ของ BANANA PYP
// ในขั้นตอนถัดไป
const LIFF_ID = "YOUR_LIFF_ID";

// 🔴 จุดที่เราจะใส่ URL ของ Google Apps Script
// ในขั้นตอนถัดไป
const API_URL = "YOUR_GOOGLE_APPS_SCRIPT_URL";


/* =====================================================
   2. GLOBAL DATA
===================================================== */

let products = [];

let cart = [];

let lineUser = {
  userId: "",
  displayName: ""
};


/* =====================================================
   3. START APPLICATION
===================================================== */

document.addEventListener("DOMContentLoaded", async function () {

  console.log("BANANA PYP MINI APP starting...");

  setMinimumPickupDate();

  document
    .getElementById("orderButton")
    .addEventListener("click", submitOrder);

  await initializeLINE();

  await loadProducts();

  renderCart();

});


/* =====================================================
   4. INITIALIZE LINE
===================================================== */

async function initializeLINE() {

  try {

    if (
      !LIFF_ID ||
      LIFF_ID === "YOUR_LIFF_ID"
    ) {

      console.log(
        "LIFF ID ยังไม่ได้ตั้งค่า"
      );

      document.getElementById(
        "customerName"
      ).textContent =
        "BANANA PYP 🍌";

      return;

    }


    await liff.init({
      liffId: LIFF_ID
    });


    console.log("LIFF initialized");


    /*
      ถ้ายังไม่ได้ Login
      ให้ LINE จัดการ Login
    */

    if (!liff.isLoggedIn()) {

      liff.login();

      return;

    }


    /*
      ดึงข้อมูลผู้ใช้ LINE
    */

    const profile = await liff.getProfile();


    lineUser.userId =
      profile.userId || "";

    lineUser.displayName =
      profile.displayName || "ลูกค้า";


    /*
      แสดงชื่อในหน้าเว็บ
    */

    document.getElementById(
      "customerName"
    ).textContent =
      lineUser.displayName;


  } catch (error) {

    console.error(
      "LINE initialization error:",
      error
    );


    document.getElementById(
      "customerName"
    ).textContent =
      "BANANA PYP 🍌";

  }

}


/* =====================================================
   5. LOAD PRODUCTS
===================================================== */

async function loadProducts() {

  const productList =
    document.getElementById(
      "productList"
    );


  try {

    /*
      ถ้ายังไม่ได้ตั้ง API
      ให้ใช้ข้อมูลตัวอย่างชั่วคราว
    */

    if (
      !API_URL ||
      API_URL ===
      "YOUR_GOOGLE_APPS_SCRIPT_URL"
    ) {

      products = [

        {
          id: "P001",
          name: "เค้ก No.1",
          price: 85,
          type: "Cake"
        },

        {
          id: "P002",
          name: "เค้ก No.2",
          price: 85,
          type: "Cake"
        },

        {
          id: "P003",
          name: "เค้ก No.3",
          price: 125,
          type: "Cake"
        },

        {
          id: "P004",
          name: "เค้ก No.4",
          price: 85,
          type: "Cake"
        },

        {
          id: "P005",
          name: "เค้ก No.5",
          price: 85,
          type: "Cake"
        },

        {
          id: "P006",
          name: "เค้ก No.6",
          price: 125,
          type: "Cake"
        },

        {
          id: "B001",
          name: "Box 4 ชิ้น ไม่มีครีมชีส",
          price: 325,
          type: "Box"
        },

        {
          id: "B002",
          name: "Box 4 ชิ้น ครีมชีส 1 ชิ้น",
          price: 365,
          type: "Box"
        }

      ];


      renderProducts();

      return;

    }


    /*
      ดึงข้อมูลสินค้าจาก Google Apps Script
    */

    const response =
      await fetch(
        API_URL +
        "?action=getProducts"
      );


    if (!response.ok) {

      throw new Error(
        "ไม่สามารถโหลดสินค้าได้"
      );

    }


    const data =
      await response.json();


    if (
      !data.success ||
      !Array.isArray(data.products)
    ) {

      throw new Error(
        "รูปแบบข้อมูลสินค้าไม่ถูกต้อง"
      );

    }


    products =
      data.products;


    renderProducts();


  } catch (error) {

    console.error(
      "Load products error:",
      error
    );


    productList.innerHTML = `

      <div class="loading">

        ไม่สามารถโหลดสินค้าได้

        <br><br>

        กรุณาลองใหม่อีกครั้ง

      </div>

    `;

  }

}


/* =====================================================
   6. RENDER PRODUCTS
===================================================== */

function renderProducts() {

  const productList =
    document.getElementById(
      "productList"
    );


  if (!products.length) {

    productList.innerHTML = `

      <div class="loading">
        ไม่พบสินค้า
      </div>

    `;

    return;

  }


  productList.innerHTML = "";


  products.forEach(function (product) {

    const cartItem =
      cart.find(
        item =>
          item.id === product.id
      );


    const quantity =
      cartItem
        ? cartItem.quantity
        : 0;


    const card =
      document.createElement(
        "div"
      );


    card.className =
      "product-card";


    if (quantity > 0) {

      card.classList.add(
        "selected"
      );

    }


    card.innerHTML = `

      <div class="product-info">

        <div class="product-name">
          ${escapeHTML(product.name)}
        </div>

        <div class="product-type">
          ${
            product.type === "Box"
              ? "กล่อง"
              : "เค้กกล้วยหอม"
          }
        </div>

        <div class="product-price">
          ${formatMoney(product.price)} บาท
        </div>

      </div>


      <div class="quantity-control">

        <button
          type="button"
          class="quantity-button"
          onclick="changeQuantity('${product.id}', -1)"
        >
          −
        </button>


        <div
          class="quantity-number"
          id="qty-${product.id}"
        >
          ${quantity}
        </div>


        <button
          type="button"
          class="quantity-button"
          onclick="changeQuantity('${product.id}', 1)"
        >
          +
        </button>

      </div>

    `;


    productList.appendChild(card);

  });

}


/* =====================================================
   7. CHANGE QUANTITY
===================================================== */

function changeQuantity(
  productId,
  change
) {

  const product =
    products.find(
      item =>
        item.id === productId
    );


  if (!product) {
    return;
  }


  let cartItem =
    cart.find(
      item =>
        item.id === productId
    );


  /*
    เพิ่มสินค้า
  */

  if (
    change > 0 &&
    !cartItem
  ) {

    cart.push({

      id: product.id,

      name: product.name,

      price:
        Number(product.price),

      quantity: 1

    });

  }


  /*
    ถ้ามีสินค้าอยู่แล้ว
  */

  else if (cartItem) {

    cartItem.quantity +=
      change;


    /*
      ถ้าจำนวนเหลือ 0
      เอาออกจากตะกร้า
    */

    if (
      cartItem.quantity <= 0
    ) {

      cart =
        cart.filter(
          item =>
            item.id !== productId
        );

    }

  }


  renderProducts();

  renderCart();

}


/* =====================================================
   8. RENDER CART
===================================================== */

function renderCart() {

  const summary =
    document.getElementById(
      "orderSummary"
    );


  if (!cart.length) {

    summary.innerHTML = `

      <div class="empty-cart">
        ยังไม่ได้เลือกสินค้า
      </div>

    `;

    return;

  }


  let html = "";

  let total = 0;


  cart.forEach(function (item) {

    const itemTotal =
      item.price *
      item.quantity;


    total +=
      itemTotal;


    html += `

      <div class="order-summary-item">

        <div class="summary-name">

          ${escapeHTML(item.name)}

          × ${item.quantity}

        </div>


        <div class="summary-price">

          ${formatMoney(itemTotal)}
          บาท

        </div>

      </div>

    `;

  });


  html += `

    <div class="order-total">

      <span>
        ยอดรวม
      </span>

      <span>
        ${formatMoney(total)}
        บาท
      </span>

    </div>

  `;


  summary.innerHTML =
    html;

}


/* =====================================================
   9. GET TOTAL
===================================================== */

function getCartTotal() {

  return cart.reduce(

    function (
      total,
      item
    ) {

      return total +
        (
          item.price *
          item.quantity
        );

    },

    0

  );

}


/* =====================================================
   10. GET QUANTITY
===================================================== */

function getCartQuantity() {

  return cart.reduce(

    function (
      total,
      item
    ) {

      return total +
        item.quantity;

    },

    0

  );

}


/* =====================================================
   11. SUBMIT ORDER
===================================================== */

async function submitOrder() {

  const button =
    document.getElementById(
      "orderButton"
    );


  /*
    ตรวจสอบสินค้า
  */

  if (!cart.length) {

    showStatus(
      "กรุณาเลือกสินค้าก่อนครับ 🍌",
      "error"
    );

    return;

  }


  /*
    ตรวจสอบวันที่
  */

  const pickupDate =
    document.getElementById(
      "pickupDate"
    ).value;


  if (!pickupDate) {

    showStatus(
      "กรุณาเลือกวันที่รับสินค้าครับ",
      "error"
    );

    return;

  }


  /*
    ตรวจสอบเวลา
  */

  const pickupTime =
    document.getElementById(
      "pickupTime"
    ).value;


  if (!pickupTime) {

    showStatus(
      "กรุณาเลือกเวลารับสินค้าครับ",
      "error"
    );

    return;

  }


  /*
    ตรวจสอบเบอร์โทร
  */

  const phone =
    document.getElementById(
      "phone"
    ).value.trim();


  if (!isValidPhone(phone)) {

    showStatus(
      "กรุณากรอกเบอร์โทรศัพท์ 10 หลักครับ",
      "error"
    );

    return;

  }


  /*
    สร้าง Order ID
  */

  const orderId =
    createOrderId();


  /*
    เตรียมรายการสินค้า
  */

  const itemsText =
    cart
      .map(
        item =>
          `${item.name} x ${item.quantity}`
      )
      .join(", ");


  /*
    สร้างข้อมูล Order
  */

  const orderData = {

    orderId:
      orderId,

    lineUserId:
      lineUser.userId,

    customerName:
      lineUser.displayName ||
      "ลูกค้า LINE",

    phone:
      phone,

    items:
      itemsText,

    quantity:
      getCartQuantity(),

    total:
      getCartTotal(),

    pickupDate:
      pickupDate,

    pickupTime:
      pickupTime

  };


  /*
    เปลี่ยนสถานะปุ่ม
  */

  button.disabled =
    true;

  button.textContent =
    "กำลังส่งคำสั่งซื้อ...";


  showStatus(
    "กำลังบันทึกคำสั่งซื้อครับ...",
    "info"
  );


  try {

    /*
      ส่งข้อมูลไป Google Apps Script
    */

    const response =
      await fetch(
        API_URL,
        {

          method: "POST",

          headers: {

            "Content-Type":
              "text/plain;charset=utf-8"

          },

          body:
            JSON.stringify(
              orderData
            )

        }
      );


    const result =
      await response.json();


    if (
      !result.success
    ) {

      throw new Error(
        result.error ||
        "ไม่สามารถบันทึกออเดอร์ได้"
      );

    }


    /*
      สำเร็จ
    */

    showStatus(
      `สั่งซื้อสำเร็จ 🎉<br>
       เลขที่ออเดอร์: <strong>${orderId}</strong><br>
       ยอดรวม: <strong>${formatMoney(orderData.total)} บาท</strong>`,
      "success"
    );


    /*
      เคลียร์ตะกร้า
    */

    cart = [];

    renderProducts();

    renderCart();


    /*
      ล้างข้อมูลบางส่วน
    */

    document.getElementById(
      "phone"
    ).value = "";


    document.getElementById(
      "pickupTime"
    ).value = "";


    /*
      ปุ่ม
    */

    button.textContent =
      "สั่งซื้อสำเร็จ ✓";


  } catch (error) {

    console.error(
      "Submit order error:",
      error
    );


    showStatus(
      "ไม่สามารถส่งคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้งครับ",
      "error"
    );


    button.disabled =
      false;

    button.textContent =
      "ดำเนินการสั่งซื้อ";

  }

}


/* =====================================================
   12. CREATE ORDER ID
===================================================== */

function createOrderId() {

  const now =
    new Date();


  const year =
    now.getFullYear();


  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");


  const day =
    String(
      now.getDate()
    ).padStart(2, "0");


  const random =
    Math.floor(
      1000 +
      Math.random() * 9000
    );


  return `BP-${year}${month}${day}-${random}`;

}


/* =====================================================
   13. SET MINIMUM PICKUP DATE
===================================================== */

function setMinimumPickupDate() {

  const input =
    document.getElementById(
      "pickupDate"
    );


  const today =
    new Date();


  const year =
    today.getFullYear();


  const month =
    String(
      today.getMonth() + 1
    ).padStart(2, "0");


  const day =
    String(
      today.getDate()
    ).padStart(2, "0");


  const dateString =
    `${year}-${month}-${day}`;


  input.min =
    dateString;


  /*
    ตั้งค่าเริ่มต้นเป็นวันนี้
  */

  input.value =
    dateString;

}


/* =====================================================
   14. VALIDATE PHONE
===================================================== */

function isValidPhone(phone) {

  /*
    รองรับเบอร์ไทย 10 หลัก
  */

  return /^0\d{9}$/.test(
    phone
  );

}


/* =====================================================
   15. FORMAT MONEY
===================================================== */

function formatMoney(number) {

  return Number(
    number || 0
  ).toLocaleString(
    "th-TH"
  );

}


/* =====================================================
   16. STATUS MESSAGE
===================================================== */

function showStatus(
  message,
  type
) {

  const status =
    document.getElementById(
      "statusMessage"
    );


  status.innerHTML =
    message;


  status.className =
    `status-message ${type}`;

}


/* =====================================================
   17. ESCAPE HTML
===================================================== */

function escapeHTML(
  value
) {

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}
