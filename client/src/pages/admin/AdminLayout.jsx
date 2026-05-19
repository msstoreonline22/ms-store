import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-ms-cream text-ms-dark lg:flex">
      <AdminSidebar />

      <div className="min-w-0 flex-1">
        <AdminTopbar />

        <main className="px-4 py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}