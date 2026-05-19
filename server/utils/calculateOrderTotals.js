const normalizeId = (value) => {
  if (!value) return "";

  if (typeof value === "string") return value;

  if (value._id) return String(value._id);

  return String(value);
};

const getOfferProductIds = (offer) => {
  if (!offer || offer.appliesToAllProducts) return [];

  return (offer.products || []).map((product) => normalizeId(product));
};

const isItemEligibleForOffer = (item, offer) => {
  if (!offer || !offer.isActive) return false;

  if (offer.appliesToAllProducts) return true;

  const offerProductIds = getOfferProductIds(offer);
  const itemProductId = normalizeId(item.product || item.productId);

  return offerProductIds.includes(itemProductId);
};

const calculateOfferDiscount = (items = [], offer = null) => {
  if (
    !offer ||
    !offer.isActive ||
    !offer.requiredQuantity ||
    !offer.offerPrice ||
    Number(offer.requiredQuantity) <= 0
  ) {
    return {
      offerTitle: "",
      offerGroups: 0,
      eligibleQuantity: 0,
      offerDiscount: 0,
    };
  }

  const requiredQuantity = Number(offer.requiredQuantity);
  const offerPrice = Number(offer.offerPrice);

  const eligibleUnitPrices = [];

  items.forEach((item) => {
    if (!isItemEligibleForOffer(item, offer)) return;

    const quantity = Number(item.quantity || 0);
    const price = Number(item.price || 0);

    for (let index = 0; index < quantity; index += 1) {
      eligibleUnitPrices.push(price);
    }
  });

  eligibleUnitPrices.sort((a, b) => b - a);

  const eligibleQuantity = eligibleUnitPrices.length;
  const offerGroups = Math.floor(eligibleQuantity / requiredQuantity);

  if (offerGroups <= 0) {
    return {
      offerTitle: offer.title || "",
      offerGroups: 0,
      eligibleQuantity,
      offerDiscount: 0,
    };
  }

  let groupedNormalSubtotal = 0;

  for (let index = 0; index < offerGroups * requiredQuantity; index += 1) {
    groupedNormalSubtotal += eligibleUnitPrices[index];
  }

  const groupedOfferSubtotal = offerGroups * offerPrice;
  const offerDiscount = Math.max(0, groupedNormalSubtotal - groupedOfferSubtotal);

  return {
    offerTitle: offer.title || "",
    offerGroups,
    eligibleQuantity,
    offerDiscount,
  };
};

const calculateOrderTotals = (
  items = [],
  deliveryFee = 0,
  discountCodeAmount = 0,
  activeOffer = null
) => {
  const totalQuantity = items.reduce((total, item) => {
    return total + Number(item.quantity || 0);
  }, 0);

  const normalSubtotal = items.reduce((total, item) => {
    return total + Number(item.price || 0) * Number(item.quantity || 0);
  }, 0);

  const offerResult = calculateOfferDiscount(items, activeOffer);

  const offerDiscount = offerResult.offerDiscount;
  const subtotalAfterOffer = normalSubtotal - offerDiscount;

  const safeDiscountCodeAmount = Math.min(
    Number(discountCodeAmount || 0),
    subtotalAfterOffer
  );

  const subtotalAfterDiscountCode =
    subtotalAfterOffer - safeDiscountCodeAmount;

  const discount = offerDiscount + safeDiscountCodeAmount;

  const total = subtotalAfterDiscountCode + Number(deliveryFee || 0);

  return {
    totalQuantity,
    normalSubtotal,
    offerTitle: offerResult.offerTitle,
    offerGroups: offerResult.offerGroups,
    eligibleOfferQuantity: offerResult.eligibleQuantity,
    offerDiscount,
    discountCodeAmount: safeDiscountCodeAmount,
    discount,
    subtotalAfterOffer,
    subtotalAfterDiscountCode,
    deliveryFee: Number(deliveryFee || 0),
    total,
  };
};

module.exports = calculateOrderTotals;