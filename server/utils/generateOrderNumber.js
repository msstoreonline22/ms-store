const Order = require("../models/Order");

const generateOrderNumber = async () => {
  const lastOrder = await Order.findOne().sort({ createdAt: -1 });

  if (!lastOrder || !lastOrder.orderNumber) {
    return "MS-1001";
  }

  const lastNumber = Number(lastOrder.orderNumber.replace("MS-", ""));
  const nextNumber = Number.isNaN(lastNumber) ? 1001 : lastNumber + 1;

  return `MS-${nextNumber}`;
};

module.exports = generateOrderNumber;