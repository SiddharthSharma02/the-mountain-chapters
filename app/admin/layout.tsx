// The auth-guarded dashboard chrome lives in app/admin/(dashboard)/layout.tsx
// so that /admin/login (a sibling route) is not wrapped by the auth guard
// and does not redirect to itself.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
