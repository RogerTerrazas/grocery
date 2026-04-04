// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { categorizeGroceryItems } from './ai'

// Mock the entire 'ai' module so no real LLM calls are made
vi.mock('ai', () => ({
  generateObject: vi.fn(),
}))

import { generateObject } from 'ai'

const mockGenerateObject = vi.mocked(generateObject)

// Helper to simulate an LLM response with the given categories
function mockLLMResponse(categories: { name: string; items: string[] }[]) {
  mockGenerateObject.mockResolvedValue({ object: { categories } } as never)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('categorizeGroceryItems', () => {
  describe('when the LLM returns all items', () => {
    it('returns the categories as-is', async () => {
      mockLLMResponse([
        { name: 'Produce', items: ['apples', 'bananas'] },
        { name: 'Dairy & Eggs', items: ['milk', 'eggs'] },
      ])

      const result = await categorizeGroceryItems([
        'apples',
        'bananas',
        'milk',
        'eggs',
      ])

      expect(result).toEqual([
        { name: 'Produce', items: ['apples', 'bananas'] },
        { name: 'Dairy & Eggs', items: ['milk', 'eggs'] },
      ])
    })

    it('does not append an Other category', async () => {
      mockLLMResponse([{ name: 'Pantry', items: ['rice'] }])

      const result = await categorizeGroceryItems(['rice'])

      expect(result).toHaveLength(1)
      expect(result.find((c) => c.name === 'Other')).toBeUndefined()
    })
  })

  describe('when the LLM drops items', () => {
    it('appends the missing items in an Other category', async () => {
      // LLM only returns 'apples' — drops 'mystery sauce' and 'tofu'
      mockLLMResponse([{ name: 'Produce', items: ['apples'] }])

      const result = await categorizeGroceryItems([
        'apples',
        'mystery sauce',
        'tofu',
      ])

      const other = result.find((c) => c.name === 'Other')
      expect(other).toBeDefined()
      expect(other?.items).toContain('mystery sauce')
      expect(other?.items).toContain('tofu')
    })

    it('places the Other category at the end', async () => {
      mockLLMResponse([
        { name: 'Produce', items: ['apples'] },
        { name: 'Dairy & Eggs', items: ['milk'] },
      ])

      const result = await categorizeGroceryItems(['apples', 'milk', 'tofu'])

      const last = result[result.length - 1]
      expect(last?.name).toBe('Other')
    })

    it('does not duplicate items already present in a category', async () => {
      mockLLMResponse([{ name: 'Produce', items: ['apples'] }])

      const result = await categorizeGroceryItems(['apples', 'tofu'])

      const allItems = result.flatMap((c) => c.items)
      const appleCount = allItems.filter((i) => i === 'apples').length
      expect(appleCount).toBe(1)
    })

    it('recovers all items when the LLM returns empty categories', async () => {
      mockLLMResponse([])

      const result = await categorizeGroceryItems(['apples', 'milk', 'bread'])

      expect(result).toHaveLength(1)
      // biome-ignore lint/style/noNonNullAssertion: length asserted above
      expect(result[0]!.name).toBe('Other')
      // biome-ignore lint/style/noNonNullAssertion: length asserted above
      expect(result[0]!.items).toEqual(['apples', 'milk', 'bread'])
    })
  })

  describe('case-insensitive matching', () => {
    it('does not mark an item as missing when casing differs from what the LLM returned', async () => {
      // LLM capitalises the item name — should still match the original
      mockLLMResponse([{ name: 'Produce', items: ['Apples'] }])

      const result = await categorizeGroceryItems(['apples'])

      expect(result.find((c) => c.name === 'Other')).toBeUndefined()
    })

    it('recovers the item using its original casing', async () => {
      // LLM drops 'Olive Oil' entirely
      mockLLMResponse([{ name: 'Produce', items: ['apples'] }])

      const result = await categorizeGroceryItems(['apples', 'Olive Oil'])

      const other = result.find((c) => c.name === 'Other')
      expect(other).toBeDefined()
      expect(other?.items).toContain('Olive Oil')
    })
  })

  describe('edge cases', () => {
    it('returns an empty array without calling the LLM when given no items', async () => {
      const result = await categorizeGroceryItems([])

      expect(result).toEqual([])
      expect(mockGenerateObject).not.toHaveBeenCalled()
    })

    it('handles a single item that the LLM returns correctly', async () => {
      mockLLMResponse([{ name: 'Pantry', items: ['salt'] }])

      const result = await categorizeGroceryItems(['salt'])

      expect(result).toEqual([{ name: 'Pantry', items: ['salt'] }])
      expect(result.find((c) => c.name === 'Other')).toBeUndefined()
    })

    it('handles a single item that the LLM drops', async () => {
      mockLLMResponse([])

      const result = await categorizeGroceryItems(['salt'])

      expect(result).toEqual([{ name: 'Other', items: ['salt'] }])
    })
  })
})
