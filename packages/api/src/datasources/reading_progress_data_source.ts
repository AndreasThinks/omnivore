import { redisDataSource } from '../redis_data_source'
import {
  ReadingProgressCacheItem,
  fetchCachedReadingPosition,
  keyForCachedReadingPosition,
  pushCachedReadingPosition,
} from '../services/cached_reading_position'

export class ReadingProgressDataSource {
  private cacheItems: { [id: string]: ReadingProgressCacheItem } = {}

  async getReadingProgress(
    uid: string,
    libraryItemID: string
  ): Promise<ReadingProgressCacheItem | undefined> {
    const cacheKey = `omnivore:reading-progress:${uid}:${libraryItemID}`
    const cached = this.cacheItems[cacheKey]
    if (cached) {
      return cached
    }
    return fetchCachedReadingPosition(uid, libraryItemID)
  }

  async updateReadingProgress(
    uid: string,
    libraryItemID: string,
    progress: {
      readingProgressPercent: number
      readingProgressTopPercent: number | undefined
      readingProgressAnchorIndex: number | undefined
    }
  ): Promise<void> {
    const cacheItem: ReadingProgressCacheItem = {
      uid,
      libraryItemID,
      updatedAt: new Date().toISOString(),
      ...progress,
    }
    const cacheKey = keyForCachedReadingPosition(uid, libraryItemID)
    if (await pushCachedReadingPosition(uid, libraryItemID, cacheItem)) {
      this.cacheItems[cacheKey] = cacheItem
    }
  }
}
