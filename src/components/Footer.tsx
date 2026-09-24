import scoreWellLogo from "../assets/scoreWellLogo.png";

const Footer = () => {
  return (
    <footer className="relative w-full overflow-hidden bg-gradient-to-r from-purple-700 via-purple-800 to-purple-950 px-5 py-6 shadow-[0_-10px_35px_rgba(91,33,182,0.22)]">
      {/* Top Gradient Accent */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-orange-400 via-purple-300 to-orange-400" />

      {/* Decorative Glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-44 w-44 rounded-full bg-purple-400/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-20 -right-20 h-44 w-44 rounded-full bg-orange-400/10 blur-3xl" />

      {/* Decorative Circle */}
      <div className="pointer-events-none absolute -right-16 -top-24 h-52 w-52 rounded-full border border-white/10" />

      <div className="relative mx-auto max-w-7xl">

        {/* Main Footer Row */}
        <div className="flex flex-col items-center justify-between gap-5 sm:flex-row sm:gap-8">

          {/* Logo */}
          <div className="shrink-0">
            <div className="relative overflow-hidden rounded-lg px-2 py-1">
              {/* Light gradient behind logo */}
              <div className="absolute inset-0 bg-gradient-to-r from-white via-purple-50 to-orange-50 opacity-95 blur-[1px]" />

              <div className="relative flex items-center bg-gradient-to-r from-white via-purple-50 to-orange-50 px-2 py-1">
                <img
                  src={scoreWellLogo}
                  alt="ScoreWell"
                  className="h-9 w-auto object-contain sm:h-10"
                />
              </div>
            </div>
          </div>

          {/* Quote */}
          <div className="max-w-2xl text-center sm:text-right">
            <p className="font-serif text-base font-semibold italic leading-6 text-white sm:text-lg">
              “Success in every examination begins with the courage to learn,
              practice, and improve.”
            </p>

            <div className="mt-2 flex items-center justify-center gap-2 sm:justify-end">
              <span className="h-[2px] w-8 rounded-full bg-purple-300" />

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300">
                Learn • Assess • Succeed
              </span>

              <span className="h-[2px] w-8 rounded-full bg-orange-300" />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-5 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Copyright */}
        <div className="text-center">
          <p className="text-[11px] font-medium tracking-wide text-white/90 sm:text-xs">
            © {new Date().getFullYear()}{" "}
            <span className="font-bold text-orange-300">
              Hemanth N.
            </span>{" "}
            <span className="text-purple-100/80">
              All rights reserved. · ScoreWell — Examination & Assessment
              Platform
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;