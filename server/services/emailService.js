const nodemailer = require("nodemailer");

const isEmailConfigured = () => {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
};

const createTransporter = () => {
  if (!isEmailConfigured()) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: process.env.EMAIL_ALLOW_SELF_SIGNED !== "true",
    },
  });
};

const formatMoney = (amount) => {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
};

const formatOrderItemsText = (items = []) => {
  return items
    .map((item, index) => {
      return `${index + 1}. ${item.name}
   Size: ${item.size}
   Color: ${item.color}
   Quantity: ${item.quantity}
   Price: ${formatMoney(item.price)}
   Line total: ${formatMoney(item.price * item.quantity)}`;
    })
    .join("\n\n");
};

const formatOrderItemsHtml = (items = []) => {
  return items
    .map((item) => {
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.size}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.color}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${formatMoney(
            item.price
          )}</td>
        </tr>
      `;
    })
    .join("");
};

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.log("EMAIL SKIPPED: EMAIL_USER or EMAIL_PASS is missing");
      return {
        success: false,
        skipped: true,
      };
    }

    const info = await transporter.sendMail({
      from: `"MS Store" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("EMAIL SENT:", {
      to,
      subject,
      messageId: info.messageId,
    });

    return {
      success: true,
      info,
    };
  } catch (error) {
    console.error("EMAIL ERROR:", error.message);

    return {
      success: false,
      error: error.message,
    };
  }
};

const sendNewOrderEmailToOwner = async (order) => {
  const ownerEmail = process.env.OWNER_EMAIL;

  if (!ownerEmail) {
    console.log("OWNER EMAIL SKIPPED: OWNER_EMAIL is missing");
    return;
  }

  const customer = order.customerInfo;

  const subject = `New order received - ${order.orderNumber}`;

  const text = `
New order received

Order number: ${order.orderNumber}
Status: ${order.status}
Payment method: ${order.paymentMethod}

Customer:
Name: ${customer.fullName}
Phone: ${customer.phone}
Second phone: ${customer.secondPhone || "N/A"}
Email: ${customer.email || "N/A"}

Address:
Governorate: ${customer.governorate}
City / Area: ${customer.city}
Full address: ${customer.address}
Notes: ${customer.notes || "N/A"}

Products:
${formatOrderItemsText(order.items)}

Totals:
Normal subtotal: ${formatMoney(order.normalSubtotal)}
Offer discount: ${formatMoney(order.offerDiscount || 0)}
Discount code: ${
  order.discountCode?.code
    ? `${order.discountCode.code} - ${formatMoney(order.discountCode.amount)}`
    : "N/A"
}
Total discount: ${formatMoney(order.discount)}
Subtotal after discounts: ${formatMoney(
  order.subtotalAfterDiscountCode || order.subtotalAfterOffer
)}
Delivery fee: ${formatMoney(order.deliveryFee)}
Total: ${formatMoney(order.total)}
`;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <h2 style="color: #0B1F3A;">New order received</h2>

      <p><strong>Order number:</strong> ${order.orderNumber}</p>
      <p><strong>Status:</strong> ${order.status}</p>
      <p><strong>Payment method:</strong> ${order.paymentMethod}</p>

      <hr style="border: none; border-top: 1px solid #eee;" />

      <h3>Customer</h3>
      <p><strong>Name:</strong> ${customer.fullName}</p>
      <p><strong>Phone:</strong> ${customer.phone}</p>
      <p><strong>Second phone:</strong> ${customer.secondPhone || "N/A"}</p>
      <p><strong>Email:</strong> ${customer.email || "N/A"}</p>

      <h3>Address</h3>
      <p><strong>Governorate:</strong> ${customer.governorate}</p>
      <p><strong>City / Area:</strong> ${customer.city}</p>
      <p><strong>Full address:</strong> ${customer.address}</p>
      <p><strong>Notes:</strong> ${customer.notes || "N/A"}</p>

      <h3>Products</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #F5F0E8;">
            <th align="left" style="padding: 10px;">Product</th>
            <th align="left" style="padding: 10px;">Size</th>
            <th align="left" style="padding: 10px;">Color</th>
            <th align="left" style="padding: 10px;">Qty</th>
            <th align="left" style="padding: 10px;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${formatOrderItemsHtml(order.items)}
        </tbody>
      </table>

      <h3>Totals</h3>
      <p><strong>Normal subtotal:</strong> ${formatMoney(order.normalSubtotal)}</p>
      <p><strong>Offer discount:</strong> ${formatMoney(order.offerDiscount || 0)}</p>
<p><strong>Discount code:</strong> ${
  order.discountCode?.code
    ? `${order.discountCode.code} - ${formatMoney(order.discountCode.amount)}`
    : "N/A"
}</p>
<p><strong>Total discount:</strong> ${formatMoney(order.discount)}</p>
<p><strong>Subtotal after discounts:</strong> ${formatMoney(
  order.subtotalAfterDiscountCode || order.subtotalAfterOffer
)}</p>
<p><strong>Delivery fee:</strong> ${formatMoney(order.deliveryFee)}</p>
      <p style="font-size: 18px;"><strong>Total:</strong> ${formatMoney(
        order.total
      )}</p>
    </div>
  `;

  return sendEmail({
    to: ownerEmail,
    subject,
    text,
    html,
  });
};

const sendOrderConfirmationEmailToCustomer = async (order) => {
  const customerEmail = order.customerInfo?.email;

  if (!customerEmail) {
    console.log("CUSTOMER EMAIL SKIPPED: customer did not enter email");
    return;
  }

  const subject = `Your MS Store order is confirmed - ${order.orderNumber}`;

  const text = `
Thank you for ordering from MS Store.

Your order number is ${order.orderNumber}.
We will contact you soon to confirm delivery.

Total: ${formatMoney(order.total)}
Payment method: ${order.paymentMethod}
Status: ${order.status}
`;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <h2 style="color: #0B1F3A;">Thank you for ordering from MS Store</h2>

      <p>Your order has been placed successfully.</p>

      <p><strong>Order number:</strong> ${order.orderNumber}</p>
      <p><strong>Total:</strong> ${formatMoney(order.total)}</p>
      <p><strong>Payment method:</strong> ${order.paymentMethod}</p>
      <p><strong>Status:</strong> ${order.status}</p>

      <p>MS Store team will contact you soon to confirm the order and delivery details.</p>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject,
    text,
    html,
  });
};

const sendNewSignupEmailToOwner = async (user) => {
  const ownerEmail = process.env.OWNER_EMAIL;

  if (!ownerEmail) {
    console.log("OWNER SIGNUP EMAIL SKIPPED: OWNER_EMAIL is missing");
    return;
  }

  const subject = `New customer registered - ${user.name}`;

  const text = `
New customer registered on MS Store

Name: ${user.name}
Email: ${user.email}
Phone: ${user.phone || "N/A"}
Role: ${user.role}
Date: ${new Date(user.createdAt).toLocaleString("en-EG")}
`;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <h2 style="color: #0B1F3A;">New customer registered</h2>

      <p><strong>Name:</strong> ${user.name}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Phone:</strong> ${user.phone || "N/A"}</p>
      <p><strong>Role:</strong> ${user.role}</p>
      <p><strong>Date:</strong> ${new Date(user.createdAt).toLocaleString(
        "en-EG"
      )}</p>
    </div>
  `;

  return sendEmail({
    to: ownerEmail,
    subject,
    text,
    html,
  });
};

const formatStatusLabel = (status) => {
  const labels = {
    pending: "Pending",
    confirmed: "Confirmed",
    preparing: "Preparing",
    out_for_delivery: "Out for delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  return labels[status] || status;
};

const getStatusMessage = (status) => {
  const messages = {
    pending:
      "Your order has been received and is waiting for confirmation.",
    confirmed:
      "Your order has been confirmed. MS Store team will start preparing it soon.",
    preparing:
      "Your order is now being prepared.",
    out_for_delivery:
      "Your order is out for delivery. Please keep your phone available.",
    delivered:
      "Your order has been delivered. Thank you for shopping from MS Store.",
    cancelled:
      "Your order has been cancelled. If you think this is a mistake, please contact MS Store.",
  };

  return messages[status] || "Your order status has been updated.";
};

const sendOrderStatusUpdateEmailToCustomer = async (order) => {
  const customerEmail = order.customerInfo?.email;

  if (!customerEmail) {
    console.log("STATUS EMAIL SKIPPED: customer did not enter email");
    return;
  }

  const statusLabel = formatStatusLabel(order.status);
  const statusMessage = getStatusMessage(order.status);

  const subject = `MS Store order update - ${order.orderNumber}`;

  const text = `
Your MS Store order status has been updated.

Order number: ${order.orderNumber}
New status: ${statusLabel}

${statusMessage}

Total: ${formatMoney(order.total)}
Payment method: ${order.paymentMethod}
`;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <h2 style="color: #0B1F3A;">Your order status has been updated</h2>

      <p><strong>Order number:</strong> ${order.orderNumber}</p>
      <p><strong>New status:</strong> ${statusLabel}</p>

      <div style="background: #F5F0E8; padding: 16px; border-radius: 16px; margin: 18px 0;">
        <p style="margin: 0;">${statusMessage}</p>
      </div>

      <p><strong>Total:</strong> ${formatMoney(order.total)}</p>
      <p><strong>Payment method:</strong> ${order.paymentMethod}</p>

      <p>Thank you for choosing MS Store.</p>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject,
    text,
    html,
  });
};

const sendDiscountCodeCampaignEmail = async ({ customers, discountCode }) => {
  if (!Array.isArray(customers) || customers.length === 0) {
    console.log("DISCOUNT CAMPAIGN SKIPPED: no customers");
    return {
      success: false,
      sent: 0,
      skipped: true,
    };
  }

  const validCustomers = customers.filter((customer) => customer.email);

  if (validCustomers.length === 0) {
    console.log("DISCOUNT CAMPAIGN SKIPPED: no customer emails");
    return {
      success: false,
      sent: 0,
      skipped: true,
    };
  }

  let sent = 0;
  let failed = 0;

  const discountText =
    discountCode.type === "percentage"
      ? `${discountCode.value}% OFF`
      : `${formatMoney(discountCode.value)} OFF`;

  for (const customer of validCustomers) {
    const subject = `Your MS Store discount code: ${discountCode.code}`;

    const text = `
Hi ${customer.name || "there"},

MS Store has a new discount code for you.

Code: ${discountCode.code}
Discount: ${discountText}
Minimum order: ${formatMoney(discountCode.minOrderAmount || 0)}
Expires: ${
      discountCode.expiresAt
        ? new Date(discountCode.expiresAt).toLocaleDateString("en-EG")
        : "No expiry"
    }

Use it before checkout to save on your next order.
`;

    const html = `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="color: #0B1F3A;">Your MS Store discount code is here</h2>

        <p>Hi ${customer.name || "there"},</p>

        <p>Use this code on your next MS Store order:</p>

        <div style="background: #F5F0E8; padding: 18px; border-radius: 18px; margin: 18px 0; text-align: center;">
          <p style="margin: 0; color: #8A8175; font-size: 13px; text-transform: uppercase;">Discount code</p>
          <p style="margin: 8px 0 0; color: #0B1F3A; font-size: 28px; font-weight: 800; letter-spacing: 2px;">
            ${discountCode.code}
          </p>
          <p style="margin: 8px 0 0; color: #0B1F3A; font-weight: 700;">
            ${discountText}
          </p>
        </div>

        <p><strong>Minimum order:</strong> ${formatMoney(
          discountCode.minOrderAmount || 0
        )}</p>
        <p><strong>Expires:</strong> ${
          discountCode.expiresAt
            ? new Date(discountCode.expiresAt).toLocaleDateString("en-EG")
            : "No expiry"
        }</p>

        <p>Thank you for choosing MS Store.</p>
      </div>
    `;

    const result = await sendEmail({
      to: customer.email,
      subject,
      text,
      html,
    });

    if (result.success) {
      sent += 1;
    } else {
      failed += 1;
    }
  }

  return {
    success: true,
    sent,
    failed,
  };
};

const sendOfferCampaignEmail = async ({ customers, offer }) => {
  if (!Array.isArray(customers) || customers.length === 0) {
    console.log("OFFER CAMPAIGN SKIPPED: no customers");
    return {
      success: false,
      sent: 0,
      skipped: true,
    };
  }

  const validCustomers = customers.filter((customer) => customer.email);

  if (validCustomers.length === 0) {
    console.log("OFFER CAMPAIGN SKIPPED: no customer emails");
    return {
      success: false,
      sent: 0,
      skipped: true,
    };
  }

  let sent = 0;
  let failed = 0;

  for (const customer of validCustomers) {
    const subject = `New MS Store offer: ${offer.title}`;

    const text = `
Hi ${customer.name || "there"},

MS Store has a new offer for you.

${offer.title}

${offer.description || ""}

Required quantity: ${offer.requiredQuantity}
Offer price: ${formatMoney(offer.offerPrice)}

Visit MS Store and build your fit.
`;

    const html = `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="color: #0B1F3A;">New MS Store offer</h2>

        <p>Hi ${customer.name || "there"},</p>

        <div style="background: #F5F0E8; padding: 18px; border-radius: 18px; margin: 18px 0;">
          <p style="margin: 0; color: #0B1F3A; font-size: 22px; font-weight: 800;">
            ${offer.title}
          </p>
          ${
            offer.description
              ? `<p style="margin: 10px 0 0;">${offer.description}</p>`
              : ""
          }
        </div>

        <p><strong>Required quantity:</strong> ${offer.requiredQuantity}</p>
        <p><strong>Offer price:</strong> ${formatMoney(offer.offerPrice)}</p>

        <p>Visit MS Store and build your fit.</p>
      </div>
    `;

    const result = await sendEmail({
      to: customer.email,
      subject,
      text,
      html,
    });

    if (result.success) {
      sent += 1;
    } else {
      failed += 1;
    }
  }

  return {
    success: true,
    sent,
    failed,
  };
};

module.exports = {
  sendEmail,
  sendNewOrderEmailToOwner,
  sendOrderConfirmationEmailToCustomer,
  sendNewSignupEmailToOwner,
  sendOrderStatusUpdateEmailToCustomer,
  sendDiscountCodeCampaignEmail,
  sendOfferCampaignEmail,
};