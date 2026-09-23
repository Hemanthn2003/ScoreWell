const Footer = () => {
  return (
    <footer className="bg-purple-800 px-5 py-5 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-1 text-center">
        <p className="text-sm font-medium">
          © {new Date().getFullYear()} Hemanth N. All rights reserved.
        </p>

        <p className="text-xs text-purple-200">
          ScoreWell — Examination & Assessment Platform
        </p>
      </div>
    </footer>
  );
};

export default Footer;