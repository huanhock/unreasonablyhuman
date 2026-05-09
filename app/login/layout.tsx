export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        body > nav { display: none !important; }
      `}</style>
      {children}
    </>
  );
}
