const calculateDiscountCode = (discountCode, subtotalAfterOffer) => {
  if (!discountCode) {
    return {
      isValid: false,
      discountAmount: 0,
      message: "Discount code not found",
    };
  }

  if (!discountCode.isActive) {
    return {
      isValid: false,
      discountAmount: 0,
      message: "Discount code is not active",
    };
  }

  if (discountCode.expiresAt && new Date(discountCode.expiresAt) < new Date()) {
    return {
      isValid: false,
      discountAmount: 0,
      message: "Discount code has expired",
    };
  }

  if (
    discountCode.usageLimit > 0 &&
    discountCode.usedCount >= discountCode.usageLimit
  ) {
    return {
      isValid: false,
      discountAmount: 0,
      message: "Discount code usage limit reached",
    };
  }

  if (subtotalAfterOffer < discountCode.minOrderAmount) {
    return {
      isValid: false,
      discountAmount: 0,
      message: `Minimum order amount is ${discountCode.minOrderAmount} EGP`,
    };
  }

  let discountAmount = 0;

  if (discountCode.type === "percentage") {
    discountAmount = subtotalAfterOffer * (discountCode.value / 100);
  }

  if (discountCode.type === "fixed") {
    discountAmount = discountCode.value;
  }

  discountAmount = Math.min(discountAmount, subtotalAfterOffer);
  discountAmount = Math.round(discountAmount);

  return {
    isValid: true,
    discountAmount,
    message: "Discount code applied successfully",
  };
};

module.exports = calculateDiscountCode;