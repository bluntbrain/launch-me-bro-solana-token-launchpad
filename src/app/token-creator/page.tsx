import { TokenCreatorFeature } from '@/components/token-creator/token-creator-feature'

export default function TokenCreatorPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Token Creator</h1>
          <p className="text-muted-foreground">
            Create SPL tokens with Token 2022 and metadata extensions using JavaScript only.
          </p>
        </div>
        <TokenCreatorFeature />
      </div>
    </div>
  )
}
