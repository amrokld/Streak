import Header from "../components/Header";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white">
      <Header />
      <main className="p-6">{children}</main>
    </div>
  );
}
