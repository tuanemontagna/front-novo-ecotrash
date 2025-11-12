"use client";

export default function Header() {
  return (
    <header className="fixed top-0 inset-x-0 h-16 z-40 bg-[linear-gradient(135deg,#48742c_0%,#5d8f3a_100%)] text-white shadow">
      <div className="mx-auto max-w-7xl h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-white/15 grid place-items-center font-bold">E</div>
          <span className="font-semibold tracking-tight">EcoTrash</span>
        </div>
        {/* Right area reserved for user menu */}
        <div className="text-sm/none opacity-90">Navegação</div>
      </div>
    </header>
  );
}
