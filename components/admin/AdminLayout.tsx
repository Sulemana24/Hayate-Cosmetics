import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminTopbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex flex-col flex-1 min-h-screen">
        {/* Navbar */}
        <AdminNavbar />
        <main className="flex-1 p-6 bg-gray-100 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
