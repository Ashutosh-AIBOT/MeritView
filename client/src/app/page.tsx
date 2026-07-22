import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">MeritView</h1>
      <p className="text-xl text-gray-600 mb-8">AI-powered contract dispute analysis</p>
      <div className="space-x-4">
        <Link href="/register" className="bg-primary text-white rounded py-2 px-6">Get Started</Link>
        <Link href="/login" className="border rounded py-2 px-6">Log In</Link>
      </div>
    </div>
  );
}
