

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <main>
        {children}
      </main>
    </div>
  );
}
