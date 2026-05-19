import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ImagePlus,
  Save,
  Upload,
  X,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import api from "../../api/axios";
import { getImageUrl } from "../../utils/getImageUrl";

const emptyForm = {
  name: "",
  description: "",
  price: 500,
  stock: 10,
  category: "T-Shirts",
  badge: "",
  imagesText: "",
  colorsText: "",
  sizesText: "M, L, XL",
  isFeatured: false,
  isActive: true,
};

function textToArray(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function arrayToText(value) {
  return Array.isArray(value) ? value.join(", ") : "";
}

export default function ProductForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(emptyForm);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const { data: product, isLoading } = useQuery({
    queryKey: ["admin-product", id],
    enabled: isEditing,
    queryFn: async () => {
      const res = await api.get(`/products/admin/${id}`);
      return res.data.product;
    },
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || 500,
        stock: product.stock ?? 10,
        category: product.category || "T-Shirts",
        badge: product.badge || "",
        imagesText: arrayToText(product.images),
        colorsText: arrayToText(product.colors),
        sizesText: arrayToText(product.sizes),
        isFeatured: Boolean(product.isFeatured),
        isActive: Boolean(product.isActive),
      });
    }
  }, [product]);

  const productImages = useMemo(() => {
    return textToArray(formData.imagesText);
  }, [formData.imagesText]);

  const selectedFilePreviews = useMemo(() => {
    return selectedFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
  }, [selectedFiles]);

  useEffect(() => {
    return () => {
      selectedFilePreviews.forEach((file) => URL.revokeObjectURL(file.url));
    };
  }, [selectedFilePreviews]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category.trim() || "T-Shirts",
        badge: formData.badge.trim(),
        images: textToArray(formData.imagesText),
        colors: textToArray(formData.colorsText),
        sizes: textToArray(formData.sizesText),
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
      };

      if (isEditing) {
        const res = await api.put(`/products/admin/${id}`, payload);
        return res.data;
      }

      const res = await api.post("/products/admin", payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Product saved successfully");

      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["featured-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });

      navigate("/admin/products");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to save product");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const uploadData = new FormData();

      selectedFiles.forEach((file) => {
        uploadData.append("images", file);
      });

      const res = await api.post("/uploads/admin/product-images", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data.images;
    },
    onSuccess: (images) => {
      const uploadedUrls = images.map((image) => image.url);

      setFormData((current) => {
        const currentImages = textToArray(current.imagesText);
        const nextImages = [...currentImages, ...uploadedUrls];

        return {
          ...current,
          imagesText: arrayToText(nextImages),
        };
      });

      setSelectedFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success("Images uploaded and added to product");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to upload images");
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) {
      setSelectedFiles([]);
      return;
    }

    const oversizedFile = files.find((file) => file.size > 5 * 1024 * 1024);

    if (oversizedFile) {
      toast.error(`${oversizedFile.name} is larger than 5MB`);
      e.target.value = "";
      return;
    }

    setSelectedFiles(files);
  };

  const handleUploadImages = () => {
    if (!selectedFiles.length) {
      toast.error("Choose images first");
      return;
    }

    uploadMutation.mutate();
  };

  const removeImageAtIndex = (indexToRemove) => {
    const nextImages = productImages.filter(
      (_, index) => index !== indexToRemove
    );

    setFormData((current) => ({
      ...current,
      imagesText: arrayToText(nextImages),
    }));

    toast.success("Image removed. Click Save changes to confirm.");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (Number(formData.price) < 0) {
      toast.error("Price cannot be negative");
      return;
    }

    if (Number(formData.stock) < 0) {
      toast.error("Stock cannot be negative");
      return;
    }

    if (!textToArray(formData.sizesText).length) {
      toast.error("Add at least one size");
      return;
    }

    saveMutation.mutate();
  };

  if (isEditing && isLoading) {
    return <p className="text-ms-muted">Loading product...</p>;
  }

  return (
    <div>
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-2 text-sm font-bold text-ms-muted hover:text-ms-navy"
      >
        <ArrowLeft size={16} />
        Back to products
      </Link>

      <div className="mt-8 mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-ms-muted">
          {isEditing ? "Edit product" : "Add product"}
        </p>

        <h2 className="mt-2 text-4xl font-black text-ms-navy">
          {isEditing ? "Update product details" : "Create new product"}
        </h2>

        <p className="mt-3 text-sm text-ms-muted">
          The owner can upload images safely without editing image URLs or file
          paths manually.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 xl:grid-cols-[1fr_360px]"
      >
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black text-ms-navy">Basic details</h3>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field
                label="Product name *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Example: Ghost Shirt"
              />

              <Field
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="T-Shirts"
              />

              <Field
                label="Price *"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
              />

              <Field
                label="Stock *"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
              />

              <Field
                label="Badge"
                name="badge"
                value={formData.badge}
                onChange={handleChange}
                placeholder="New Drop, Best Seller..."
              />

              <div className="flex items-center gap-5 rounded-2xl bg-ms-cream px-4 py-3">
                <label className="flex items-center gap-2 text-sm font-bold text-ms-navy">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                  />
                  Featured
                </label>

                <label className="flex items-center gap-2 text-sm font-bold text-ms-navy">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  Visible
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-bold text-ms-navy">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Describe the product..."
                  className="mt-2 w-full rounded-2xl border border-ms-border bg-ms-cream px-4 py-3 text-sm outline-none focus:border-ms-navy"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black text-ms-navy">Variants</h3>

            <p className="mt-2 text-sm text-ms-muted">
              Sizes are required. Colors are optional because MS Store products
              are design-based.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field
                label="Sizes *"
                name="sizesText"
                value={formData.sizesText}
                onChange={handleChange}
                placeholder="M, L, XL"
              />

              <Field
                label="Colors optional"
                name="colorsText"
                value={formData.colorsText}
                onChange={handleChange}
                placeholder="Leave empty if no color choice"
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black text-ms-navy">Upload images</h3>

            <p className="mt-2 text-sm text-ms-muted">
              Choose images from your device, upload them, then click Save
              changes.
            </p>

            <div className="mt-5 rounded-2xl bg-ms-cream p-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="w-full rounded-2xl border border-ms-border bg-white px-4 py-3 text-sm"
              />

              <button
                type="button"
                onClick={handleUploadImages}
                disabled={uploadMutation.isPending || !selectedFiles.length}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-ms-navy px-5 py-3 text-sm font-black text-white transition hover:bg-ms-blue disabled:cursor-not-allowed disabled:bg-ms-muted"
              >
                <Upload size={17} />
                {uploadMutation.isPending
                  ? "Uploading..."
                  : "Upload selected images"}
              </button>
            </div>

            {selectedFilePreviews.length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-bold text-ms-navy">
                  Selected images before upload
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {selectedFilePreviews.map((file) => (
                    <div
                      key={file.url}
                      className="overflow-hidden rounded-2xl border border-ms-border bg-ms-cream"
                    >
                      <img
                        src={file.url}
                        alt={file.name}
                        className="aspect-square w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black text-ms-navy">
              Current product images
            </h3>

            <p className="mt-2 text-sm text-ms-muted">
              These images will show on the product page. Remove only the images
              you no longer want, then click Save changes.
            </p>

            {productImages.length > 0 ? (
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                {productImages.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="group relative overflow-hidden rounded-2xl border border-ms-border bg-ms-cream"
                  >
                    <img
                      src={getImageUrl(image)}
                      alt="Product preview"
                      className="aspect-square w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeImageAtIndex(index)}
                      className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-600 opacity-0 shadow transition group-hover:opacity-100"
                      aria-label="Remove image"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-ms-border bg-ms-cream p-8 text-center">
                <ImagePlus className="mx-auto text-ms-muted" size={28} />
                <p className="mt-3 text-sm text-ms-muted">
                  No images added yet. Upload images above.
                </p>
              </div>
            )}
          </div>
        </div>

        <aside className="h-fit rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm xl:sticky xl:top-28">
          <h3 className="text-xl font-black text-ms-navy">Save product</h3>

          <p className="mt-3 text-sm leading-6 text-ms-muted">
            Upload or remove images first, then save the product so all changes
            are stored.
          </p>

          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ms-navy px-6 py-4 text-sm font-black text-white transition hover:bg-ms-blue disabled:cursor-not-allowed disabled:bg-ms-muted"
          >
            <Save size={17} />
            {saveMutation.isPending
              ? "Saving..."
              : isEditing
              ? "Save changes"
              : "Create product"}
          </button>

          <Link
            to="/admin/products"
            className="mt-3 inline-flex w-full justify-center rounded-full border border-ms-border bg-white px-6 py-4 text-sm font-black text-ms-navy transition hover:bg-ms-cream"
          >
            Cancel
          </Link>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      <label className="text-sm font-bold text-ms-navy">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={type === "number" ? 0 : undefined}
        className="mt-2 w-full rounded-2xl border border-ms-border bg-ms-cream px-4 py-3 text-sm outline-none focus:border-ms-navy"
      />
    </div>
  );
}