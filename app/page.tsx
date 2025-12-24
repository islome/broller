"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="relative flex min-h-screen w-full flex-col items-start justify-between py-16 px-6 sm:py-32 sm:px-16 bg-white dark:bg-black overflow-hidden">
        <div className="absolute inset-0 z-0 sm:hidden">
          <Image
            src="/chicken1.jpg"
            alt="Background"
            fill
            className="object-cover opacity-50"
            priority
          />
        </div>

        <div className="absolute inset-0 z-0 hidden sm:block">
          <Image
            src="/farm1.jpg"
            alt="Background"
            fill
            className="object-cover opacity-60"
            priority
          />
        </div>

        <div className="relative z-10 w-full">
          <h1 className="max-w-xs text-2xl sm:text-3xl font-semibold leading-8 sm:leading-10 tracking-tight text-black dark:text-zinc-50">
            Broller
          </h1>
        </div>

        <div className="relative z-10 flex flex-col items-start gap-4 sm:gap-6 text-left w-full">
          <h2 className="max-w-xs sm:max-w-md text-2xl sm:text-3xl font-semibold leading-8 sm:leading-10 tracking-tight text-black dark:text-zinc-50">
            Ushbu sahifa sinov tariqasida yaratildi
          </h2>
          <p className="max-w-md text-base sm:text-lg leading-7 sm:leading-8 text-black dark:text-zinc-400">
            Hozirda <strong className="text-black">Broller</strong> kompaniyasi
            uchun website yaratish jarayoni olib borilmoqda.{" "}
            <span className="text-black sm:text-2xl font-semibold block mt-2">
              2026-yil Fevral
            </span>{" "}
            oyidan sahifani ommaviy deploy qilinadi
          </p>
          <Link
            href="/register"
            className="group inline-flex items-center justify-center rounded-md text-base sm:text-lg font-medium bg-black dark:bg-white text-white dark:text-black px-6 py-3 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden relative"
          >
            <span className="relative z-10 group-hover:animate-[flipUp_0.6s_ease-in-out]">
              Ro'yxatdan o'tish
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-zinc-800 to-black dark:from-zinc-200 dark:to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Link>
        </div>

        <div className="relative z-10 w-full">
          <div className="w-full max-w-md border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 sm:p-6 bg-white/80 dark:bg-black/80 backdrop-blur-sm shadow-sm">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-4">
              Developer bilan bog'laning
            </h3>
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 sm:h-16 sm:w-16 shrink-0 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <Image
                  src="/avatar.PNG"
                  alt="Developer"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-1 gap-3">
                <div>
                  <p className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    Islombek Kamoliddinov
                  </p>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                    Full-stack Developer
                  </p>
                </div>

                <button
                  onClick={() =>
                    window.open("https://t.me/justislombek", "_blank")
                  }
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-black dark:bg-white text-white dark:text-black px-4 py-2 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors whitespace-nowrap"
                >
                  Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
