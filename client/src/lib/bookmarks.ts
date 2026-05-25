import { Preferences } from '@capacitor/preferences';
import type { Verse } from '@shared/schema';

const BOOKMARKS_KEY = 'church_bookmarks';

export interface BookmarkedVerse extends Verse {
  bookmarkedAt: number; // timestamp
}

/**
 * 북마크 목록 가져오기
 */
export async function getBookmarks(): Promise<BookmarkedVerse[]> {
  try {
    const { value } = await Preferences.get({ key: BOOKMARKS_KEY });
    if (value) {
      const bookmarks = JSON.parse(value) as BookmarkedVerse[];
      // 최신순 정렬
      return bookmarks.sort((a, b) => b.bookmarkedAt - a.bookmarkedAt);
    }
    return [];
  } catch (error) {
    console.error('북마크 가져오기 실패:', error);
    return [];
  }
}

/**
 * 북마크 추가
 */
export async function addBookmark(verse: Verse): Promise<void> {
  try {
    const bookmarks = await getBookmarks();
    
    // 이미 북마크된 경우 중복 방지
    const exists = bookmarks.find(b => b.id === verse.id && b.ageGroup === verse.ageGroup);
    if (exists) {
      console.log('이미 북마크된 구절입니다.');
      return;
    }
    
    const bookmarkedVerse: BookmarkedVerse = {
      ...verse,
      bookmarkedAt: Date.now(),
    };
    
    bookmarks.push(bookmarkedVerse);
    await Preferences.set({
      key: BOOKMARKS_KEY,
      value: JSON.stringify(bookmarks),
    });
    
    console.log('북마크 추가 완료:', verse.reference);
  } catch (error) {
    console.error('북마크 추가 실패:', error);
    throw error;
  }
}

/**
 * 북마크 제거
 */
export async function removeBookmark(verseId: number, ageGroup: string): Promise<void> {
  try {
    const bookmarks = await getBookmarks();
    const filtered = bookmarks.filter(b => !(b.id === verseId && b.ageGroup === ageGroup));
    
    await Preferences.set({
      key: BOOKMARKS_KEY,
      value: JSON.stringify(filtered),
    });
    
    console.log('북마크 제거 완료:', verseId);
  } catch (error) {
    console.error('북마크 제거 실패:', error);
    throw error;
  }
}

/**
 * 북마크 여부 확인
 */
export async function isBookmarked(verseId: number, ageGroup: string): Promise<boolean> {
  try {
    const bookmarks = await getBookmarks();
    return bookmarks.some(b => b.id === verseId && b.ageGroup === ageGroup);
  } catch (error) {
    console.error('북마크 확인 실패:', error);
    return false;
  }
}

/**
 * 북마크 토글 (추가/제거)
 */
export async function toggleBookmark(verse: Verse): Promise<boolean> {
  const isCurrentlyBookmarked = await isBookmarked(verse.id, verse.ageGroup);
  
  if (isCurrentlyBookmarked) {
    await removeBookmark(verse.id, verse.ageGroup);
    return false;
  } else {
    await addBookmark(verse);
    return true;
  }
}

/**
 * 모든 북마크 삭제
 */
export async function clearAllBookmarks(): Promise<void> {
  try {
    await Preferences.remove({ key: BOOKMARKS_KEY });
    console.log('모든 북마크 삭제 완료');
  } catch (error) {
    console.error('북마크 삭제 실패:', error);
    throw error;
  }
}

