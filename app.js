const LIFF_ID = "2011754643-QvvqgzbX";

const API_URL =
  "https://script.google.com/macros/s/AKfycbyjgkCZeyEiXyqmK9GyzFYqNVQviOY6tgznDxo_LHo2MgkKr199yd1Skv_LiQshvMQ0YQ/exec";

const PROMPTPAY_ID = "1101100055692";

let products = [];
let cart = [];

let lineUser = {
  userId: "",
  displayName: ""
};

let currentOrder = {
  orderId: "",
  total: 0
};


// ========================================
// START APP
// ========================================

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    console.log(
      "BANANA PYP MINI APP starting..."
    );

    setMinimumPickupDate();

    const orderButton =
      document.getElementById(
        "orderButton"
      );

    if (orderButton) {

      orderButton.addEventListener(
        "click",
        submitOrder
      );

    }


    const paymentButton =
      document.getElementById(
        "paymentConfirmButton"
      );

    if (paymentButton) {

      paymentButton.addEventListener(
        "click",
        confirmPayment
      );

    }


    const refreshOrdersButton =
      document.getElementById(
        "refreshOrdersButton"
      );

    if (refreshOrdersButton) {

      refreshOrdersButton.addEventListener(
        "click",
        loadMyOrders
      );

    }


    setupPhoneValidation();

    await initializeLINE();

    await loadProducts();

    renderCart();

  }
);


// ========================================
// PHONE VALIDATION
// ========================================

function setupPhoneValidation() {

  const phoneInput =
    document.getElementById(
      "customerPhone"
    );


  if (!phoneInput) {

    console.warn(
      "ไม่พบช่องเบอร์มือถือ #customerPhone"
    );

    return;

  }


  phoneInput.setAttribute(
    "inputmode",
    "numeric"
  );

  phoneInput.setAttribute(
    "maxlength",
    "10"
  );


  phoneInput.addEventListener(
    "input",
    function () {

      let phone =
        phoneInput.value.replace(
          /\D/g,
          ""
        );


      if (phone.length > 10) {

        phone =
          phone.substring(
            0,
            10
          );

      }


      phoneInput.value =
        phone;


      validatePhoneField();

    }
  );


  phoneInput.addEventListener(
    "blur",
    function () {

      validatePhoneField();

    }
  );

}


// ========================================
// VALIDATE PHONE
// ========================================

function validatePhoneField() {

  const phoneInput =
    document.getElementById(
      "customerPhone"
    );


  if (!phoneInput) {

    return false;

  }


  const phone =
    phoneInput.value.trim();


  let errorElement =
    document.getElementById(
      "phoneError"
    );


  if (!errorElement) {

    errorElement =
      document.createElement(
        "div"
      );

    errorElement.id =
      "phoneError";

    errorElement.style.fontSize =
      "13px";

    errorElement.style.marginTop =
      "6px";

    phoneInput.parentElement.appendChild(
      errorElement
    );

  }


  if (!phone) {

    errorElement.textContent =
      "";

    return false;

  }


  if (!/^0\d{9}$/.test(phone)) {

    errorElement.textContent =
      "กรุณากรอกเบอร์มือถือให้ครบ 10 หลัก";

    errorElement.style.color =
      "#d93025";

    return false;

  }


  errorElement.textContent =
    "✓ เบอร์มือถือถูกต้อง";

  errorElement.style.color =
    "#188038";

  return true;

}


// ========================================
// LINE LIFF
// ========================================

async function initializeLINE() {

  try {

    if (
      !LIFF_ID ||
      LIFF_ID ===
      "ใส่ LIFF ID เดิมของคุณ"
    ) {

      console.log(
        "LIFF ID ยังไม่ได้ตั้งค่า"
      );

      const nameElement =
        document.getElementById(
          "customerName"
        );

      if (nameElement) {

        nameElement.value =
          "BANANA PYP 🍌";

        nameElement.textContent =
          "BANANA PYP 🍌";

      }

      return;

    }


    await liff.init({
      liffId:
        LIFF_ID
    });


    console.log(
      "LIFF initialized"
    );


    if (!liff.isLoggedIn()) {

      liff.login();

      return;

    }


    const profile =
      await liff.getProfile();


    lineUser.userId =
      profile.userId || "";


    lineUser.displayName =
      profile.displayName ||
      "ลูกค้า";


    const nameElement =
      document.getElementById(
        "customerName"
      );


    if (nameElement) {

      if (
        nameElement.tagName ===
        "INPUT"
      ) {

        nameElement.value =
          lineUser.displayName;

      }

      else {

        nameElement.textContent =
          lineUser.displayName;

      }

    }


    // โหลดออเดอร์ของลูกค้าหลัง LINE Login
    await loadMyOrders();


  } catch (error) {

    console.error(
      "LINE initialization error:",
      error
    );


    const nameElement =
      document.getElementById(
        "customerName"
      );


    if (nameElement) {

      if (
        nameElement.tagName ===
        "INPUT"
      ) {

        nameElement.value =
          "BANANA PYP 🍌";

      }

      else {

        nameElement.textContent =
          "BANANA PYP 🍌";

      }

    }

  }

}


// ========================================
// LOAD PRODUCTS
// ========================================

async function loadProducts() {

  const productList =
    document.getElementById(
      "productList"
    );


  try {

    if (
      !API_URL ||
      API_URL ===
      "ใส่ Google Apps Script Web App URL เดิมของคุณ"
    ) {

      products = [

        {
          id:
            "P001",

          name:
            "เค้กกล้วยหอมทอง",

          price:
            85,

          type:
            "Cake"
        },

        {
          id:
            "P002",

          name:
            "เค้กกล้วยหอมทอง อัลมอนด์",

          price:
            85,

          type:
            "Cake"
        },

        {
          id:
            "P003",

          name:
            "เค้กกล้วยหอมทอง ครีมชีส",

          price:
            125,

          type:
            "Cake"
        },

        {
          id:
            "P004",

          name:
            "เค้กกล้วยหอมช๊อกโก้",

          price:
            85,

          type:
            "Cake"
        },

        {
          id:
            "P005",

          name:
            "เค้กกล้วยหอมช๊อกโก้ อัลมอนด์",

          price:
            85,

          type:
            "Cake"
        },

        {
          id:
            "P006",

          name:
            "เค้กกล้วยหอมช๊อกโก้ ครีมชีส",

          price:
            125,

          type:
            "Cake"
        },

        {
          id:
            "B001",

          name:
            "Box 4 ชิ้น ไม่มีครีมชีส",

          price:
            325,

          type:
            "Box"
        },

        {
          id:
            "B002",

          name:
            "Box 4 ชิ้น ครีมชีส 1 ชิ้น",

          price:
            365,

          type:
            "Box"
        }

      ];


      renderProducts();

      return;

    }


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
      !Array.isArray(
        data.products
      )
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


    if (productList) {

      productList.innerHTML =
        `
        <div class="loading">

          ไม่สามารถโหลดสินค้าได้

          <br><br>

          กรุณาลองใหม่อีกครั้ง

        </div>
        `;

    }

  }

}


// ========================================
// RENDER PRODUCTS
// ========================================

function renderProducts() {

  const productList =
    document.getElementById(
      "productList"
    );


  if (!productList) {

    return;

  }


  if (!products.length) {

    productList.innerHTML =
      `
      <div class="loading">
        ไม่พบสินค้า
      </div>
      `;

    return;

  }


  productList.innerHTML =
    "";


  products.forEach(
    function (product) {

      const cartItem =
        cart.find(
          item =>
            item.id ===
            product.id
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


      card.innerHTML =
        `
        <div class="product-info">

          <div class="product-name">

            ${escapeHTML(
              product.name
            )}

          </div>

          <div class="product-type">

            ${
              product.type === "Box"
                ? "กล่อง"
                : "เค้กกล้วยหอม"
            }

          </div>

          <div class="product-price">

            ${formatMoney(
              product.price
            )}

            บาท

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


      productList.appendChild(
        card
      );

    }
  );

}


// ========================================
// CART
// ========================================

function changeQuantity(
  productId,
  change
) {

  const product =
    products.find(
      item =>
        item.id ===
        productId
    );


  if (!product) {

    return;

  }


  let cartItem =
    cart.find(
      item =>
        item.id ===
        productId
    );


  if (
    change > 0 &&
    !cartItem
  ) {

    cart.push({

      id:
        product.id,

      name:
        product.name,

      price:
        Number(
          product.price
        ),

      quantity:
        1

    });

  }


  else if (cartItem) {

    cartItem.quantity +=
      change;


    if (
      cartItem.quantity <=
      0
    ) {

      cart =
        cart.filter(
          item =>
            item.id !==
            productId
        );

    }

  }


  renderProducts();

  renderCart();

}


// ========================================
// RENDER CART
// ========================================

function renderCart() {

  const summary =
    document.getElementById(
      "orderSummary"
    );


  if (!summary) {

    return;

  }


  if (!cart.length) {

    summary.innerHTML =
      `
      <div class="empty-cart">
        ยังไม่ได้เลือกสินค้า
      </div>
      `;

    return;

  }


  let html =
    "";

  let total =
    0;


  cart.forEach(
    function (item) {

      const itemTotal =
        item.price *
        item.quantity;


      total +=
        itemTotal;


      html +=
        `
        <div class="order-summary-item">

          <div class="summary-name">

            ${escapeHTML(
              item.name
            )}

            × ${item.quantity}

          </div>


          <div class="summary-price">

            ${formatMoney(
              itemTotal
            )}

            บาท

          </div>

        </div>
        `;

    }
  );


  html +=
    `
    <div class="order-total">

      <span>
        ยอดรวม
      </span>

      <span>

        ${formatMoney(
          total
        )}

        บาท

      </span>

    </div>
    `;


  summary.innerHTML =
    html;

}


// ========================================
// CART TOTAL
// ========================================

function getCartTotal() {

  return cart.reduce(
    function (
      total,
      item
    ) {

      return (
        total +
        (
          item.price *
          item.quantity
        )
      );

    },
    0
  );

}


function getCartQuantity() {

  return cart.reduce(
    function (
      total,
      item
    ) {

      return (
        total +
        item.quantity
      );

    },
    0
  );

}


// ========================================
// SUBMIT ORDER
// ========================================

async function submitOrder() {

  const button =
    document.getElementById(
      "orderButton"
    );


  if (!cart.length) {

    showStatus(
      "กรุณาเลือกสินค้าก่อนครับ 🍌",
      "error"
    );

    return;

  }


  const pickupDate =
    document.getElementById(
      "pickupDate"
    )?.value;


  if (!pickupDate) {

    showStatus(
      "กรุณาเลือกวันที่รับสินค้าครับ",
      "error"
    );

    return;

  }


  const pickupTime =
    document.getElementById(
      "pickupTime"
    )?.value;


  if (!pickupTime) {

    showStatus(
      "กรุณาเลือกเวลารับสินค้าครับ",
      "error"
    );

    return;

  }


  // ====================================
  // PHONE CHECK
  // ====================================

  const phoneInput =
    document.getElementById(
      "customerPhone"
    );


  if (!phoneInput) {

    showStatus(
      "ไม่พบช่องเบอร์มือถือในระบบ กรุณารีเฟรชหน้า MINI APP",
      "error"
    );

    return;

  }


  const phone =
    phoneInput.value.trim();


  if (!isValidPhone(phone)) {

    validatePhoneField();


    showStatus(
      "กรุณากรอกเบอร์มือถือให้ครบ 10 หลักครับ",
      "error"
    );


    phoneInput.focus();

    return;

  }


  // ====================================
  // CHECK LINE USER
  // ====================================

  if (!lineUser.userId) {

    showStatus(
      "กำลังเชื่อมต่อ LINE กรุณารอสักครู่แล้วลองใหม่ครับ",
      "error"
    );

    return;

  }


  // ====================================
  // CREATE ORDER
  // ====================================

  const orderId =
    createOrderId();


  const itemsText =
    cart
      .map(
        item =>
          item.name +
          " x " +
          item.quantity
      )
      .join(", ");


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


  if (button) {

    button.disabled =
      true;

    button.textContent =
      "กำลังส่งคำสั่งซื้อ...";

  }


  showStatus(
    "กำลังบันทึกคำสั่งซื้อครับ...",
    "info"
  );


  try {

    const response =
      await fetch(
        API_URL,
        {

          method:
            "POST",

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


    if (!result.success) {

      throw new Error(
        result.error ||
        "ไม่สามารถบันทึกออเดอร์ได้"
      );

    }


    currentOrder.orderId =
      orderId;


    currentOrder.total =
      orderData.total;


    showStatus(
      `
      สั่งซื้อสำเร็จ 🎉

      <br>

      เลขที่ออเดอร์:

      <strong>
        ${escapeHTML(
          orderId
        )}
      </strong>

      <br>

      ยอดรวม:

      <strong>
        ${formatMoney(
          orderData.total
        )}

        บาท
      </strong>
      `,
      "success"
    );


    showPaymentSection(
      orderId,
      orderData.total
    );


    cart =
      [];


    renderProducts();

    renderCart();


    phoneInput.value =
      "";


    const pickupTimeInput =
      document.getElementById(
        "pickupTime"
      );


    if (pickupTimeInput) {

      pickupTimeInput.value =
        "";

    }


    if (button) {

      button.textContent =
        "สั่งซื้อสำเร็จ ✓";

    }


    // โหลดออเดอร์ใหม่ทันที
    await loadMyOrders();


  } catch (error) {

    console.error(
      "Submit order error:",
      error
    );


    showStatus(
      "ไม่สามารถส่งคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้งครับ",
      "error"
    );


    if (button) {

      button.disabled =
        false;

      button.textContent =
        "ดำเนินการสั่งซื้อ";

    }

  }

}


// ========================================
// PAYMENT SECTION
// ========================================

function showPaymentSection(
  orderId,
  total
) {

  const section =
    document.getElementById(
      "paymentSection"
    );


  const orderIdElement =
    document.getElementById(
      "paymentOrderId"
    );


  const totalElement =
    document.getElementById(
      "paymentTotal"
    );


  if (!section) {

    console.error(
      "ไม่พบ paymentSection"
    );

    return;

  }


  if (orderIdElement) {

    orderIdElement.textContent =
      orderId;

  }


  if (totalElement) {

    totalElement.textContent =
      formatMoney(total) +
      " บาท";

  }


  section.style.display =
    "block";


  generatePromptPayQR(
    total
  );


  section.scrollIntoView({
    behavior:
      "smooth",

    block:
      "start"

  });

}


function generatePromptPayQR(amount) {
  const qr = document.getElementById("promptpayQR");

  if (!qr) {
    console.error("ไม่พบรูป QR #promptpayQR");
    return;
  }

  // ใช้ QR LINE BK จริงที่อัปโหลดไว้ใน GitHub
  qr.src = "linebk-qr.png";

  qr.alt =
    "QR รับชำระเงิน BANANA PYP ยอด " +
    formatMoney(amount) +
    " บาท";

  console.log(
    "ใช้ LINE BK QR สำหรับยอด " +
    formatMoney(amount) +
    " บาท"
  );
}

// ========================================
// PROMPTPAY PAYLOAD
// ========================================

function createPromptPayPayload(
  target,
  amount
) {

  const id =
    String(target)
      .replace(
        /\D/g,
        ""
      );


  let targetTag =
    "";

  let targetValue =
    "";


  // ======================================
  // PromptPay Mobile Number
  // ======================================

  if (
    id.length === 10
  ) {

    targetTag =
      "01";


    targetValue =
      "0066" +
      id.substring(1);

  }


  // ======================================
  // PromptPay National ID / Tax ID
  // ======================================

  else if (
    id.length === 13
  ) {

    targetTag =
      "02";


    targetValue =
      id;

  }


  else {

    throw new Error(
      "PromptPay ID ไม่ถูกต้อง"
    );

  }


  // ======================================
  // PromptPay Merchant Account
  // ======================================

  const merchantAccount =
    targetTag +
    String(
      targetValue.length
    ).padStart(
      2,
      "0"
    ) +
    targetValue;


  // ======================================
  // IMPORTANT:
  // Correct PromptPay AID
  // ======================================

  const merchantAccountInformation =
    "0016A000000677010111" +
    merchantAccount;


  const merchantAccountField =
    "29" +
    String(
      merchantAccountInformation.length
    ).padStart(
      2,
      "0"
    ) +
    merchantAccountInformation;


  // ======================================
  // Amount
  // ======================================

  const amountText =
    Number(amount)
      .toFixed(2);


  // ======================================
  // Base Payload
  // ======================================

  let payload =
    "000201" +
    "010212" +
    merchantAccountField +
    "52040000" +
    "5303764" +
    "5802TH";


  // ======================================
  // Transaction Amount
  // ======================================

  if (
    Number(amount) > 0
  ) {

    payload +=
      "54" +
      String(
        amountText.length
      ).padStart(
        2,
        "0"
      ) +
      amountText;

  }


  // ======================================
  // CRC
  // ======================================

  payload +=
    "6304";


  const crc =
    calculateCRC16(
      payload
    );


  return (
    payload +
    crc
  );

}


// ========================================
// CRC16
// ========================================

function calculateCRC16(
  text
) {

  let crc =
    0xFFFF;


  for (
    let i = 0;
    i < text.length;
    i++
  ) {

    crc ^=
      text.charCodeAt(i) <<
      8;


    for (
      let j = 0;
      j < 8;
      j++
    ) {

      if (
        crc & 0x8000
      ) {

        crc =
          (
            crc << 1
          ) ^
          0x1021;

      }

      else {

        crc <<=
          1;

      }


      crc &=
        0xFFFF;

    }

  }


  return crc
    .toString(16)
    .toUpperCase()
    .padStart(
      4,
      "0"
    );

}


// ========================================
// CONFIRM PAYMENT
// ========================================

async function confirmPayment() {

  const button =
    document.getElementById(
      "paymentConfirmButton"
    );


  const status =
    document.getElementById(
      "paymentStatus"
    );


  if (!currentOrder.orderId) {

    if (status) {

      status.textContent =
        "ไม่พบเลขที่ออเดอร์";

      status.className =
        "status-message error";

    }

    return;

  }


  const confirmed =
    window.confirm(
      "ยืนยันว่าคุณได้โอนเงินตามยอดออเดอร์แล้วใช่หรือไม่?"
    );


  if (!confirmed) {

    return;

  }


  if (button) {

    button.disabled =
      true;

    button.textContent =
      "กำลังแจ้งชำระเงิน...";

  }


  if (status) {

    status.textContent =
      "กำลังส่งข้อมูลให้ร้านตรวจสอบ...";

    status.className =
      "status-message info";

  }


  try {

    const response =
      await fetch(
        API_URL,
        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "text/plain;charset=utf-8"

          },

          body:
            JSON.stringify({

              action:
                "confirmPayment",

              orderId:
                currentOrder.orderId

            })

        }
      );


    const result =
      await response.json();


    if (!result.success) {

      throw new Error(
        result.error ||
        "ไม่สามารถแจ้งชำระเงินได้"
      );

    }


    if (status) {

      status.innerHTML =
        `
        แจ้งชำระเงินเรียบร้อยแล้ว ✅

        <br>

        <strong>
          เลขที่ออเดอร์:
          ${escapeHTML(
            currentOrder.orderId
          )}
        </strong>

        <br><br>

        ร้านจะตรวจสอบยอดเงิน
        และยืนยันการชำระเงินให้ครับ
        `;


      status.className =
        "status-message success";

    }


    if (button) {

      button.textContent =
        "แจ้งชำระเงินแล้ว ✓";

    }


    await loadMyOrders();


  } catch (error) {

    console.error(
      "Confirm payment error:",
      error
    );


    if (status) {

      status.textContent =
        "แจ้งชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้งครับ";

      status.className =
        "status-message error";

    }


    if (button) {

      button.disabled =
        false;

      button.textContent =
        "ฉันชำระเงินแล้ว";

    }

  }

}


// ========================================
// MY ORDERS
// ========================================

async function loadMyOrders() {

  const container =
    document.getElementById(
      "myOrdersList"
    );


  if (!container) {

    return;

  }


  if (!lineUser.userId) {

    container.innerHTML =
      `
      <div class="loading">
        กำลังเชื่อมต่อ LINE...
      </div>
      `;

    return;

  }


  container.innerHTML =
    `
    <div class="loading">
      กำลังโหลดออเดอร์ของคุณ...
    </div>
    `;


  try {

    const url =
      API_URL +
      "?action=getMyOrders&lineUserId=" +
      encodeURIComponent(
        lineUser.userId
      );


    const response =
      await fetch(url);


    if (!response.ok) {

      throw new Error(
        "ไม่สามารถโหลดออเดอร์ได้"
      );

    }


    const data =
      await response.json();


    if (
      !data.success ||
      !Array.isArray(
        data.orders
      )
    ) {

      throw new Error(
        data.error ||
        "ข้อมูลออเดอร์ไม่ถูกต้อง"
      );

    }


    renderMyOrders(
      data.orders
    );


  } catch (error) {

    console.error(
      "Load my orders error:",
      error
    );


    container.innerHTML =
      `
      <div class="loading">

        ไม่สามารถโหลดออเดอร์ได้

        <br><br>

        <button
          type="button"
          onclick="loadMyOrders()"
        >
          ลองใหม่
        </button>

      </div>
      `;

  }

}


// ========================================
// RENDER MY ORDERS
// ========================================

function renderMyOrders(
  orders
) {

  const container =
    document.getElementById(
      "myOrdersList"
    );


  if (!container) {

    return;

  }


  if (!orders.length) {

    container.innerHTML =
      `
      <div class="empty-cart">

        ยังไม่มีออเดอร์ครับ 🍌

        <br><br>

        เลือกสินค้าแล้วสั่งซื้อได้เลย

      </div>
      `;

    return;

  }


  let html =
    "";


  orders.forEach(
    function (order) {

      const orderStatus =
        getOrderStatusDisplay(
          order.orderStatus
        );


      const paymentStatus =
        getPaymentStatusDisplay(
          order.paymentStatus
        );


      html +=
        `
        <div class="my-order-card">

          <div class="my-order-header">

            <div>

              <div class="my-order-label">
                เลขที่ออเดอร์
              </div>

              <strong>
                ${escapeHTML(
                  order.orderId
                )}
              </strong>

            </div>

            <div class="my-order-date">

              ${escapeHTML(
                order.orderDate || ""
              )}

            </div>

          </div>


          <div class="my-order-items">

            ${escapeHTML(
              order.items || ""
            )}

          </div>


          <div class="my-order-row">

            <span>
              ยอดรวม
            </span>

            <strong>
              ${formatMoney(
                order.total
              )} บาท
            </strong>

          </div>


          <div class="my-order-row">

            <span>
              วันรับสินค้า
            </span>

            <strong>
              ${escapeHTML(
                order.pickupDate || "-"
              )}
            </strong>

          </div>


          <div class="my-order-row">

            <span>
              เวลารับ
            </span>

            <strong>
              ${escapeHTML(
                order.pickupTime || "-"
              )}
            </strong>

          </div>


          <div class="my-order-status">

            <div>

              <span>
                สถานะออเดอร์
              </span>

              <span
                class="order-status-badge ${orderStatus.className}"
              >
                ${orderStatus.icon}
                ${escapeHTML(
                  orderStatus.text
                )}
              </span>

            </div>


            <div>

              <span>
                การชำระเงิน
              </span>

              <span
                class="order-status-badge ${paymentStatus.className}"
              >
                ${paymentStatus.icon}
                ${escapeHTML(
                  paymentStatus.text
                )}
              </span>

            </div>

          </div>


        </div>
        `;

    }
  );


  container.innerHTML =
    html;

}


// ========================================
// ORDER STATUS DISPLAY
// ========================================

function getOrderStatusDisplay(
  status
) {

  switch (
    String(status || "")
      .trim()
  ) {

    case "กำลังเตรียม":

      return {
        text:
          "กำลังเตรียม",
        icon:
          "👨‍🍳",
        className:
          "status-preparing"
      };


    case "พร้อมรับ":

      return {
        text:
          "พร้อมรับสินค้า",
        icon:
          "✅",
        className:
          "status-ready"
      };


    case "รับสินค้าแล้ว":

      return {
        text:
          "รับสินค้าแล้ว",
        icon:
          "🎉",
        className:
          "status-complete"
      };


    case "ยกเลิก":

      return {
        text:
          "ยกเลิก",
        icon:
          "❌",
        className:
          "status-cancelled"
      };


    default:

      return {
        text:
          "รอตรวจสอบ",
        icon:
          "⏳",
        className:
          "status-pending"
      };

  }

}


// ========================================
// PAYMENT STATUS DISPLAY
// ========================================

function getPaymentStatusDisplay(
  status
) {

  switch (
    String(status || "")
      .trim()
  ) {

    case "ชำระแล้ว":

      return {
        text:
          "ชำระเงินแล้ว",
        icon:
          "✅",
        className:
          "status-paid"
      };


    case "รอตรวจสอบการชำระเงิน":

      return {
        text:
          "รอตรวจสอบยอด",
        icon:
          "🔎",
        className:
          "status-checking"
      };


    case "ยกเลิก":

      return {
        text:
          "ยกเลิก",
        icon:
          "❌",
        className:
          "status-cancelled"
      };


    default:

      return {
        text:
          "รอชำระเงิน",
        icon:
          "💳",
        className:
          "status-unpaid"
      };

  }

}


// ========================================
// ORDER ID
// ========================================

function createOrderId() {

  const now =
    new Date();


  const year =
    now.getFullYear();


  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );


  const random =
    Math.floor(
      1000 +
      Math.random() *
      9000
    );


  return (
    "BP-" +
    year +
    month +
    day +
    "-" +
    random
  );

}


// ========================================
// MINIMUM PICKUP DATE
// ========================================

function setMinimumPickupDate() {

  const input =
    document.getElementById(
      "pickupDate"
    );


  if (!input) {

    return;

  }


  const today =
    new Date();


  const year =
    today.getFullYear();


  const month =
    String(
      today.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      today.getDate()
    ).padStart(
      2,
      "0"
    );


  const dateString =
    year +
    "-" +
    month +
    "-" +
    day;


  input.min =
    dateString;


  input.value =
    dateString;

}


// ========================================
// PHONE CHECK
// ========================================

function isValidPhone(
  phone
) {

  return /^0\d{9}$/.test(
    phone
  );

}


// ========================================
// FORMAT MONEY
// ========================================

function formatMoney(
  number
) {

  return Number(
    number || 0
  ).toLocaleString(
    "th-TH"
  );

}


// ========================================
// STATUS
// ========================================

function showStatus(
  message,
  type
) {

  const status =
    document.getElementById(
      "statusMessage"
    );


  if (!status) {

    return;

  }


  status.innerHTML =
    message;


  status.className =
    "status-message " +
    type;

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(
  value
) {

  return String(
    value
  )

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
