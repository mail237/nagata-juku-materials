type PageContainerProps = {
  children: React.ReactNode;
};

export function PageContainer({ children }: PageContainerProps) {
  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-4 pb-8">{children}</main>
  );
}
