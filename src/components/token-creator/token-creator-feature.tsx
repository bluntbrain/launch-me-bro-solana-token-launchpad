'use client'

import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Keypair, SystemProgram, Transaction } from '@solana/web3.js'
import {
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
  createInitializeMintInstruction,
  getMintLen,
  createInitializeMetadataPointerInstruction,
  TYPE_SIZE,
  LENGTH_SIZE,
} from '@solana/spl-token'
import {
  createInitializeInstruction,
  createUpdateFieldInstruction,
  pack,
  TokenMetadata,
} from '@solana/spl-token-metadata'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useTransactionToast } from '../use-transaction-toast'
import { ImageUpload } from './image-upload'
import Image from 'next/image'

interface TokenForm {
  name: string
  symbol: string
  uri: string
  decimals: number
  description: string
}

export function TokenCreatorFeature() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const { transactionToast } = useTransactionToast()

  const [isLoading, setIsLoading] = useState(false)
  const [createdMint, setCreatedMint] = useState<string | null>(null)
  const [form, setForm] = useState<TokenForm>({
    name: '',
    symbol: '',
    uri: '',
    decimals: 9,
    description: '',
  })

  const handleInputChange = (field: keyof TokenForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = (): string | null => {
    if (!form.name.trim()) return 'Token name is required'
    if (form.name.length > 32) return 'Token name must be 32 characters or less'
    if (!form.symbol.trim()) return 'Token symbol is required'
    if (form.symbol.length > 10) return 'Token symbol must be 10 characters or less'
    if (!form.uri.trim()) return 'Token URI is required'
    if (form.decimals < 0 || form.decimals > 9) return 'Decimals must be between 0 and 9'
    return null
  }

  const createToken = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet')
      return
    }

    const validationError = validateForm()
    if (validationError) {
      toast.error(validationError)
      return
    }

    setIsLoading(true)

    try {
      // Generate new keypair for Mint Account
      const mintKeypair = Keypair.generate()
      const mint = mintKeypair.publicKey

      // Authority that can mint new tokens and update metadata
      const mintAuthority = publicKey
      const updateAuthority = publicKey

      // Metadata to store in Mint Account
      const metaData: TokenMetadata = {
        updateAuthority: updateAuthority,
        mint: mint,
        name: form.name,
        symbol: form.symbol,
        uri: form.uri,
        additionalMetadata: form.description ? [['description', form.description]] : [],
      }

      // Calculate account size and rent
      const metadataExtension = TYPE_SIZE + LENGTH_SIZE
      const metadataLen = pack(metaData).length
      const mintLen = getMintLen([ExtensionType.MetadataPointer])
      const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataExtension + metadataLen)

      // Build instructions
      const createAccountInstruction = SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mint,
        space: mintLen,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      })

      const initializeMetadataPointerInstruction = createInitializeMetadataPointerInstruction(
        mint,
        updateAuthority,
        mint, // Metadata stored on mint account itself
        TOKEN_2022_PROGRAM_ID,
      )

      const initializeMintInstruction = createInitializeMintInstruction(
        mint,
        form.decimals,
        mintAuthority,
        null, // No freeze authority
        TOKEN_2022_PROGRAM_ID,
      )

      const initializeMetadataInstruction = createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        metadata: mint,
        updateAuthority: updateAuthority,
        mint: mint,
        mintAuthority: mintAuthority,
        name: metaData.name,
        symbol: metaData.symbol,
        uri: metaData.uri,
      })

      // Build transaction
      const transaction = new Transaction()
      transaction.add(
        createAccountInstruction,
        initializeMetadataPointerInstruction,
        initializeMintInstruction,
        initializeMetadataInstruction,
      )

      // Add description if provided
      if (form.description) {
        const updateFieldInstruction = createUpdateFieldInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: mint,
          updateAuthority: updateAuthority,
          field: 'description',
          value: form.description,
        })
        transaction.add(updateFieldInstruction)
      }

      // Send transaction
      const signature = await sendTransaction(transaction, connection, {
        signers: [mintKeypair],
      })

      await connection.confirmTransaction(signature, 'confirmed')

      setCreatedMint(mint.toString())
      transactionToast(signature)
      toast.success('Token created successfully!')

      // Reset form
      setForm({
        name: '',
        symbol: '',
        uri: '',
        decimals: 9,
        description: '',
      })
    } catch (error) {
      console.error('Error creating token:', error)
      toast.error('Failed to create token')
    } finally {
      setIsLoading(false)
    }
  }

  const viewTokenOnExplorer = () => {
    if (createdMint) {
      window.open(`https://explorer.solana.com/address/${createdMint}?cluster=devnet`, '_blank')
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Token with Metadata</CardTitle>
          <CardDescription>
            Create a new SPL Token with Token 2022 and metadata extensions. No custom program required!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Token Name</Label>
              <Input
                id="name"
                placeholder="My Awesome Token"
                value={form.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                maxLength={32}
              />
              <p className="text-sm text-muted-foreground mt-1">{form.name.length}/32 characters</p>
            </div>

            <div>
              <Label htmlFor="symbol">Token Symbol</Label>
              <Input
                id="symbol"
                placeholder="MAT"
                value={form.symbol}
                onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                maxLength={10}
              />
              <p className="text-sm text-muted-foreground mt-1">{form.symbol.length}/10 characters</p>
            </div>
          </div>

          <div>
            <Label>Token Image</Label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <ImageUpload onImageUploaded={(url) => handleInputChange('uri', url)} />
              </div>
              {form.uri && (
                <div className="w-24 h-24 relative rounded-lg overflow-hidden border border-gray-200">
                  <Image src={form.uri} alt="Token preview" fill className="object-cover" unoptimized />
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="A revolutionary token for the future"
              value={form.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="decimals">Decimals</Label>
            <Input
              id="decimals"
              type="number"
              min="0"
              max="9"
              value={form.decimals}
              onChange={(e) => handleInputChange('decimals', parseInt(e.target.value) || 0)}
            />
          </div>

          <Button onClick={createToken} disabled={!publicKey || isLoading} className="w-full">
            {isLoading ? 'Creating Token...' : 'Create Token'}
          </Button>
        </CardContent>
      </Card>

      {createdMint && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Token Created Successfully! 🎉</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Mint Address</Label>
              <Input value={createdMint} readOnly />
            </div>
            <Button onClick={viewTokenOnExplorer} variant="outline" className="w-full">
              View on Solana Explorer
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
