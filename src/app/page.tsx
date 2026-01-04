import FlowEditor from '@/components/FlowEditor';

export default function Home() {
  return (
    <main
  className="flex min-h-screen flex-col text-white bg-cover bg-center"
  style={{
    backgroundImage: "url('../public/backgrounds/nebula.jpg')",
  }}
>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header Section */}
        <header className="p-6 border-b border-white/10 flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Nebula Cloud
          </h1>
          <div className="text-sm text-gray-300">Workflow Builder</div>
        </header>

        {/* Canvas Section */}
        <div className="flex-grow w-full h-[85vh] relative bg-blue-900">
          <FlowEditor />
        </div>
      </div>
    </main>
  );
}
