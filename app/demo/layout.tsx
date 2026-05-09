export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        body > main { max-width: none !important; padding: 0 !important; min-height: auto !important; }
        body > nav { display: none !important; }
      `}</style>
      {children}
    </>
  );
}
