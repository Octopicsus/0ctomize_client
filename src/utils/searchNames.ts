import { MoneyItem } from "../store/features/moneyHistorySlice"
import Fuse from 'fuse.js'

export function searchNames(arr: MoneyItem[], input: string): MoneyItem[] {
    if (!input.trim()) {
        return arr
    }

    const fuse = new Fuse(arr, {
        keys: ['title', 'description'],
        threshold: 0.4,
        includeScore: false,
        minMatchCharLength: 1,
        ignoreLocation: true,
        findAllMatches: true,
        useExtendedSearch: true
    })

    const results = fuse.search(input)
    return results.map(result => result.item)
}


