import { useEffect, useState } from "react";
import { KeyRound, Save } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import api from "../../api/axios";

const emptyForm = {
  brandName: "",
  contactEmail: "",
  phoneNumbersText: "",
  whatsappNumber: "",
  instagramUrl: "",
  instapayNumber: "01210439134",
  cairoGizaFee: 85,
  otherGovernoratesFee: 150,
  announcementText: "",
  homepageOfferText: "",
  logoUrl: "",
};

const emptyPasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
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

export default function Settings() {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState(emptyForm);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);

  const {
    data: settings,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const res = await api.get("/settings/admin");
      return res.data.settings;
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        brandName: settings.brandName || "",
        contactEmail: settings.contactEmail || "",
        phoneNumbersText: arrayToText(settings.phoneNumbers),
        whatsappNumber: settings.whatsappNumber || "",
        instagramUrl: settings.instagramUrl || "",
        instapayNumber: settings.instapayNumber || "01210439134",
        cairoGizaFee: settings.deliveryFees?.cairoGiza ?? 85,
        otherGovernoratesFee: settings.deliveryFees?.otherGovernorates ?? 150,
        announcementText: settings.announcementText || "",
        homepageOfferText: settings.homepageOfferText || "",
        logoUrl: settings.logoUrl || "",
      });
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        brandName: formData.brandName.trim(),
        contactEmail: formData.contactEmail.trim(),
        phoneNumbers: textToArray(formData.phoneNumbersText),
        whatsappNumber: formData.whatsappNumber.trim(),
        instagramUrl: formData.instagramUrl.trim(),
        instapayNumber: formData.instapayNumber.trim(),
        deliveryFees: {
          cairoGiza: Number(formData.cairoGizaFee),
          otherGovernorates: Number(formData.otherGovernoratesFee),
        },
        announcementText: formData.announcementText.trim(),
        homepageOfferText: formData.homepageOfferText.trim(),
        logoUrl: formData.logoUrl.trim(),
      };

      const res = await api.put("/settings/admin", payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Settings updated successfully");

      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update settings");
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put("/auth/update-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Password updated successfully");
      setPasswordForm(emptyPasswordForm);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update password");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmitSettings = (e) => {
    e.preventDefault();

    if (Number(formData.cairoGizaFee) < 0) {
      toast.error("Cairo/Giza delivery fee cannot be negative");
      return;
    }

    if (Number(formData.otherGovernoratesFee) < 0) {
      toast.error("Other governorates delivery fee cannot be negative");
      return;
    }

    updateSettingsMutation.mutate();
  };

  const handleSubmitPassword = (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      toast.error("Current password is required");
      return;
    }

    if (!passwordForm.newPassword) {
      toast.error("New password is required");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    updatePasswordMutation.mutate();
  };

  if (isLoading) {
    return <p className="text-ms-muted">Loading settings...</p>;
  }

  if (isError) {
    return (
      <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">
        Failed to load settings. Make sure you are logged in as admin.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-ms-muted">
          Settings
        </p>
        <h2 className="mt-2 text-4xl font-black text-ms-navy">
          Store settings
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ms-muted">
          Control the store contact info, delivery fees, InstaPay number,
          homepage texts, and admin password.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmitSettings} className="space-y-6">
          <div className="rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black text-ms-navy">
              Brand information
            </h3>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field
                label="Brand name"
                name="brandName"
                value={formData.brandName}
                onChange={handleChange}
                placeholder="MS Store Egypt"
              />

              <Field
                label="Contact email"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="msstoreegyptonline559@gmail.com"
              />

              <Field
                label="Phone numbers"
                name="phoneNumbersText"
                value={formData.phoneNumbersText}
                onChange={handleChange}
                placeholder="010..., 011..."
                helper="Separate multiple numbers with commas."
              />

              <Field
                label="WhatsApp number"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                placeholder="010..."
              />

              <Field
                label="Instagram link"
                name="instagramUrl"
                value={formData.instagramUrl}
                onChange={handleChange}
                placeholder="https://www.instagram.com/ms.storeeonlinee/"
              />

              <Field
                label="Logo URL / path"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                placeholder="/images/logo/logo.webp"
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black text-ms-navy">
              Payment and delivery
            </h3>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field
                label="InstaPay number"
                name="instapayNumber"
                value={formData.instapayNumber}
                onChange={handleChange}
                placeholder="01210439134"
              />

              <div />

              <Field
                label="Cairo/Giza delivery fee"
                name="cairoGizaFee"
                type="number"
                value={formData.cairoGizaFee}
                onChange={handleChange}
                placeholder="85"
              />

              <Field
                label="Other governorates delivery fee"
                name="otherGovernoratesFee"
                type="number"
                value={formData.otherGovernoratesFee}
                onChange={handleChange}
                placeholder="150"
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black text-ms-navy">Website texts</h3>

            <div className="mt-6 space-y-4">
              <Field
                label="Announcement text"
                name="announcementText"
                value={formData.announcementText}
                onChange={handleChange}
                placeholder="3 T-Shirts for 1000 EGP"
              />

              <div>
                <label className="text-sm font-bold text-ms-navy">
                  Homepage offer text
                </label>
                <textarea
                  name="homepageOfferText"
                  value={formData.homepageOfferText}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Build your fit: 3 graphic t-shirts for only 1000 EGP."
                  className="mt-2 w-full rounded-2xl border border-ms-border bg-ms-cream px-4 py-3 text-sm outline-none focus:border-ms-navy"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={updateSettingsMutation.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ms-navy px-6 py-4 text-sm font-black text-white transition hover:bg-ms-blue disabled:cursor-not-allowed disabled:bg-ms-muted md:w-auto"
          >
            <Save size={17} />
            {updateSettingsMutation.isPending ? "Saving..." : "Save settings"}
          </button>
        </form>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm xl:sticky xl:top-28">
            <h3 className="text-xl font-black text-ms-navy">Quick summary</h3>

            <p className="mt-3 text-sm leading-6 text-ms-muted">
              These values affect the customer website immediately after saving.
              Delivery fees are used in checkout.
            </p>

            <div className="mt-5 rounded-2xl bg-ms-cream p-4 text-sm text-ms-navy">
              <p className="font-black">Current delivery rules</p>
              <p className="mt-2">
                Cairo/Giza: <strong>{formData.cairoGizaFee || 0} EGP</strong>
              </p>
              <p>
                Other governorates:{" "}
                <strong>{formData.otherGovernoratesFee || 0} EGP</strong>
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmitPassword}
            className="rounded-[2rem] border border-ms-border bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ms-cream text-ms-navy">
                <KeyRound size={21} />
              </div>

              <div>
                <h3 className="text-xl font-black text-ms-navy">
                  Change password
                </h3>
                <p className="text-sm text-ms-muted">
                  Use this before going live.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <Field
                label="Current password"
                name="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Current password"
              />

              <Field
                label="New password"
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="New password"
              />

              <Field
                label="Confirm new password"
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={updatePasswordMutation.isPending}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ms-navy px-6 py-4 text-sm font-black text-white transition hover:bg-ms-blue disabled:cursor-not-allowed disabled:bg-ms-muted"
            >
              <KeyRound size={17} />
              {updatePasswordMutation.isPending
                ? "Updating..."
                : "Update password"}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  helper,
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
      {helper && <p className="mt-2 text-xs text-ms-muted">{helper}</p>}
    </div>
  );
}
