export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        body > nav { display: none !important; }
      `}</style>
      {children}
    </>
  );
}
