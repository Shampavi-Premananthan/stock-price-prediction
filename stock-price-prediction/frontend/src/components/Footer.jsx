export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line/70 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 text-center text-sm text-muted">
        <p>
          Built with FastAPI, TensorFlow, and React — an educational forecasting
          tool, not investment advice.
        </p>
        <p className="font-mono text-xs text-muted/70">
          © {new Date().getFullYear()} Quantis Labs
        </p>
      </div>
    </footer>
  );
}
