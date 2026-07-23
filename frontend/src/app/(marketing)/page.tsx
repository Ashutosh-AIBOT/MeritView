import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">MeritView</h1>
        <div className="space-x-4">
          <Link href="/login" className="text-gray-700 hover:text-blue-600">Sign In</Link>
          <Link href="/register" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Get Started</Link>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">AI-Powered Dispute Analysis</h2>
        <p className="text-xl text-gray-600 mb-8">
          Get a structured, multi-model evaluation of your contract dispute for just $49.
          Decision support, not legal advice.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register" className="rounded bg-blue-600 px-6 py-3 text-white text-lg hover:bg-blue-700">
            Start My Analysis
          </Link>
          <Link href="/pricing" className="rounded border px-6 py-3 text-gray-700 hover:bg-gray-50">
            View Pricing
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-bold mb-2">3-Model Evaluation</h3>
          <p className="text-gray-600">Groq Llama 3 70B, Mixtral 8x7B, and Gemini 1.5 Pro analyze your dispute independently.</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-bold mb-2">Fast Turnaround</h3>
          <p className="text-gray-600">Get your structured opinion in hours, not weeks. Manual aggregation ensures quality.</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-bold mb-2">Affordable</h3>
          <p className="text-gray-600">$49 flat fee. No hourly rates, no surprises. Decision support you can actually afford.</p>
        </div>
      </section>
    </main>
  );
}
