import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Image
            src="/smallLogo.jpg"
            alt="Tamarind Dhow"
            width={48}
            height={48}
            className="rounded-lg shadow-sm"
          />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-primary tracking-tight leading-none">
              Tamarind Dhow
            </span>
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mt-0.5">
              Tamarind Group
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm font-semibold text-gray-700 hover:text-primary transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-hover transition-all shadow-lg shadow-brand-500/20 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Book Now
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto container px-6 py-12 md:py-20 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000">
            <div className="space-y-4">
              <h3 className="text-primary font-bold tracking-widest text-sm uppercase">
                Welcome to Tamarind Mombasa
              </h3>
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
                Experience the Magic of the <span className="text-primary">Dhow Voyage</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
                Step aboard the world-famous Tamarind Dhow for an unforgettable seafood dining experience. 
                Sail across the tranquil waters of the Mombasa creek as the sun sets over the horizon.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/login"
                className="bg-primary text-white px-8 py-4 rounded-2xl text-base font-bold hover:bg-primary-hover transition-all shadow-xl shadow-brand-500/30 transform hover:-translate-y-1 active:translate-y-0"
              >
                Start Your Voyage
              </Link>
              <button className="px-8 py-4 rounded-2xl text-base font-bold text-gray-700 border-2 border-gray-100 hover:bg-gray-50 transition-all">
                View Gallery
              </button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-100">
              <div>
                <p className="text-2xl font-bold text-gray-900">4.9/5</p>
                <p className="text-sm text-gray-500">Guest Rating</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">20k+</p>
                <p className="text-sm text-gray-500">Happy Voyages</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">100%</p>
                <p className="text-sm text-gray-500">Fresh Seafood</p>
              </div>
            </div>
          </div>

          {/* Image Content */}
          <div className="relative group animate-in fade-in slide-in-from-right duration-1000">
            <div className="absolute -inset-4 bg-primary/5 rounded-[2.5rem] -rotate-3 scale-95 group-hover:rotate-0 group-hover:scale-100 transition-transform duration-700"></div>
            <div className="relative overflow-hidden rounded-[2rem] shadow-2xl aspect-[4/5] md:aspect-[3/4]">
              <Image
                src="/dhow/1.jpg"
                alt="Tamarind Dhow Voyage"
                fill
                className="object-cover transform group-hover:scale-105 transition-transform duration-1000"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg inline-flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    ★
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-none">Voted Top Experience</p>
                    <p className="text-xs text-gray-500 mt-1">TripAdvisor 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="py-12 border-t border-gray-100 mt-12 text-center">
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Tamarind Management Limited. 
          Part of the <span className="font-semibold text-gray-600">Tamarind Group</span>.
        </p>
      </footer>
    </div>
  );
}