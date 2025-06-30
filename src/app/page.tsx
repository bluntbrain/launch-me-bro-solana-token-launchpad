import { TokenCreatorFeature } from '@/components/token-creator/token-creator-feature'

export default function HomePage() {
  return (
    <div className="container mx-auto py-12">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter solana-glow">Launch Me Bro</h1>
          <p className="text-xl text-muted-foreground">Create and launch your Solana tokens with ease</p>
        </div>
        <TokenCreatorFeature />
      </div>
    </div>
  )
}
