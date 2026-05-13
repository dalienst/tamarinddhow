import Navbar from "@/components/private/Navbar";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      <main>
        {children}
      </main>
    </div>
  );
}
