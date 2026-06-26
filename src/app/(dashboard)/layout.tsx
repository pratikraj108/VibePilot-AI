import { LayoutWrapper } from "@/components/LayoutWrapper";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <LayoutWrapper>{children}</LayoutWrapper>
    </ProtectedRoute>
  );
}
