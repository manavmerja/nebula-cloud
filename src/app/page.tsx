import { Suspense } from 'react'; // <--- 1. Import Suspense
import FlowEditor from '@/components/FlowEditor';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      {/* Header Section */}
      <header className="p-6 border-b border-gray-800 flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Nebula Cloud
        </h1>
        <div className="text-sm text-gray-400">Workflow Builder</div>
      </header>

      {/* Canvas Section */}
      <div className="flex-grow w-full h-[85vh] relative">
        {/* 2. Fix: FlowEditor ko Suspense me wrap kiya */}
        <Suspense fallback={
          <div className="flex h-full w-full items-center justify-center text-cyan-500">
            Loading Editor... ⏳
          </div>
        }>
          <FlowEditor />
        </Suspense>
      </div>
    </main>
  );
}