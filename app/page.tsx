import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="relative flex min-h-screen w-full max-w-3xl flex-col items-start justify-between py-16 px-6 sm:py-32 sm:px-16 bg-white dark:bg-black overflow-hidden">
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
            className="object-cover opacity-40"
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
            Islombek Kamoliddinov Sayfiddin o'g'li
          </h2>
          <p className="max-w-md text-base sm:text-lg leading-7 sm:leading-8 text-zinc-600 dark:text-zinc-500">
            Hozirda <strong>Broller</strong> kompaniyasi uchun website yaratish jarayoni olib borilmoqda.{" "}
            <span className="text-black sm:text-2xl font-bold block mt-2">
              2026-yil Fevral
            </span>{" "}
            oyidan sahifani ommaviy deploy qilinadi
          </p>
        </div>

        <div className="relative z-10 w-full">
          Undan oldingi versiyalar sinov tariqasida taqdim etiladi!
        </div>
      </main>
    </div>
  );
}