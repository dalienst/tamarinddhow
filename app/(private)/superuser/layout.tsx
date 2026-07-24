import Navbar from "@/components/private/Navbar";

export default function SuperuserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
