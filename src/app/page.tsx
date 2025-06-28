import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="container mx-auto py-12">
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter solana-glow">Launch Me Bro</h1>
          <p className="text-xl text-muted-foreground">Create and launch your Solana tokens with ease</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <Link href="/token-creator" className="block">
            <div className="solana-button h-full">
              <div className="solana-button-content p-6 text-center">
                <h3 className="text-xl font-semibold mb-2 text-white">Token Creator</h3>
                <p className="text-white/80">Create tokens with JavaScript only - no Rust required!</p>
              </div>
            </div>
          </Link>

          <div className="solana-button h-full opacity-70 cursor-not-allowed">
            <div className="solana-button-content p-6 text-center">
              <h3 className="text-xl font-semibold mb-2 text-white">Token Creator Pro</h3>
              <p className="text-white/80">Advanced token creation with Rust program</p>
              <span className="inline-block mt-2 px-3 py-1 bg-white/10 rounded-full text-sm text-white/90">
                Coming Soon
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="solana-card p-6">
            <h2 className="text-2xl font-semibold mb-4">Why Choose Us?</h2>
            <div className="grid gap-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold">Simple & Fast</h3>
                  <p className="text-muted-foreground">Create tokens in minutes with our JavaScript-only approach</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold">Token 2022 Support</h3>
                  <p className="text-muted-foreground">Full support for Token 2022 features and metadata extensions</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold">Rich Metadata</h3>
                  <p className="text-muted-foreground">Add custom metadata, images, and social links to your token</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
