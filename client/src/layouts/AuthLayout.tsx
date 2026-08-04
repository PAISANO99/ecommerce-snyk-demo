import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  backgroundImage: string;
  pageTitle: string;
  pageDescription?: React.ReactNode;
  showMobileIntro?: boolean;
  sideTitle: React.ReactNode;
  sideSubtitle?: React.ReactNode;
  sideBottom?: React.ReactNode;
  gradient?: string;
  badge?: {
    text: string;
    color?: string;
  };
}

export default function AuthLayout({
  children,
  backgroundImage,
  pageTitle,
  pageDescription,
  showMobileIntro = true,
  sideTitle,
  sideSubtitle,
  sideBottom,
  gradient,
  badge,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#f8f9fc] font-sans overflow-x-hidden">
      {/* Left side banner — Desktop only */}
      <div className="hidden lg:flex relative w-1/2 overflow-hidden bg-black flex-col justify-center p-[60px]">
        <img
          src={backgroundImage}
          className="absolute top-0 left-0 w-full h-full object-cover opacity-90 z-[1]"
          alt=""
          aria-hidden="true"
        />
        <div
          className="absolute top-0 left-0 w-full h-full z-[2]"
          style={{
            background:
              gradient ||
              "linear-gradient(135deg, rgba(30, 20, 100, 0.4), rgba(10, 50, 160, 0.7))",
          }}
        />

        {badge && (
          <div
            className={`inline-block ${
              badge.color || "bg-white/15 backdrop-blur-xl"
            } py-2 px-4 rounded-lg mb-8 font-display italic font-extrabold tracking-wide z-[3]`}
          >
            {badge.text}
          </div>
        )}

        <div className="relative z-[3] text-white my-auto">
          <div className="font-display text-[4.5rem] font-extrabold leading-[1.05] m-0 mb-6 drop-shadow-lg">
            {sideTitle}
          </div>
          {sideSubtitle && (
            <p className="text-lg leading-relaxed max-w-[450px] opacity-95 drop-shadow-md">
              {sideSubtitle}
            </p>
          )}
        </div>

        {sideBottom && (
          <div className="absolute bottom-10 left-[60px] text-[0.7rem] text-white/50 font-medium tracking-wide uppercase z-[3]">
            {sideBottom}
          </div>
        )}
      </div>

      {/* Right side */}
      <main className="relative flex w-full flex-col items-center justify-center px-4 py-8 sm:px-5 sm:py-10 lg:w-1/2">
        {showMobileIntro && (
          <div className="mb-6 w-full max-w-[480px] lg:hidden sm:mb-8">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
              Vibra Shop
            </p>
            <h1 className="mb-3 text-3xl font-display font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {pageTitle}
            </h1>
            {pageDescription && (
              <p className="text-sm leading-6 text-slate-600">{pageDescription}</p>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
