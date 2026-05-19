export function getImageUrl(image) {
  const placeholder = "/images/products/placeholder.webp";
  const imageUrl =
    typeof image === "string" ? image.trim() : image?.secure_url || image?.url;

  if (!imageUrl) return placeholder;

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/images/")) {
    return imageUrl;
  }

  return imageUrl;
}
