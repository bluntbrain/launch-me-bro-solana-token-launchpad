import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function ellipsify(str = '', len = 4, delimiter = '..') {
  const strLen = str.length
  const limit = len * 2 + delimiter.length

  return strLen >= limit ? str.substring(0, len) + delimiter + str.substring(strLen - len, strLen) : str
}

export function createMetadataUrl(content: string): string {
  // Base64 encode the content to handle special characters
  const encodedContent = Buffer.from(content).toString('base64');
  
  // Create a data URL with the encoded content
  return `data:application/json;base64,${encodedContent}`;
}
