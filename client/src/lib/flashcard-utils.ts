/**
 * 플래시카드 유틸리티
 * - 자동 빈칸 생성
 * - 보기 생성
 * - 정답 체크
 */

export type DifficultyLevel = 'easy' | 'hard' | 'expert';

export interface BlankWord {
  index: number;        // 단어의 인덱스
  original: string;     // 원래 단어
  userAnswer?: string;  // 사용자 답변
}

export interface FlashcardData {
  words: string[];           // 전체 단어 배열
  blanks: BlankWord[];       // 빈칸 정보
  choices?: string[];        // 보기 (easy 모드용)
}

/**
 * 한국어 중요 단어 판별
 * - 명사, 동사, 형용사 우선
 * - 2음절 이상 단어
 * - 조사, 접속사 제외
 */
function isImportantWord(word: string): boolean {
  // 1글자는 제외
  if (word.length <= 1) return false;
  
  // 조사 및 접속사 제외
  const excludeWords = [
    '은', '는', '이', '가', '을', '를', '의', '에', '에서', '로', '으로',
    '와', '과', '도', '만', '부터', '까지', '처럼', '같이',
    '그리고', '그러나', '하지만', '또는', '또', '및',
    '그', '이', '저', '등', '것'
  ];
  
  if (excludeWords.includes(word)) return false;
  
  // 숫자만 있는 경우 제외
  if (/^\d+$/.test(word)) return false;
  
  return true;
}

/**
 * 문장을 단어로 분리
 */
function splitIntoWords(text: string): string[] {
  // 공백, 쉼표, 마침표 등으로 분리
  return text
    .split(/(\s+|,|\.|\?|!|;|:)/)
    .filter(word => word.trim().length > 0);
}

/**
 * 난이도별 빈칸 개수 결정
 */
function getBlankCount(totalWords: number, difficulty: DifficultyLevel): number {
  switch (difficulty) {
    case 'easy':
      return Math.min(5, Math.max(3, Math.floor(totalWords * 0.2)));
    case 'hard':
      return Math.min(10, Math.max(7, Math.floor(totalWords * 0.4)));
    case 'expert':
      return totalWords; // 전체
    default:
      return 3;
  }
}

/**
 * 자동 빈칸 생성
 */
export function generateBlanks(
  content: string,
  difficulty: DifficultyLevel
): FlashcardData {
  const words = splitIntoWords(content);
  const totalWords = words.length;
  const blankCount = getBlankCount(totalWords, difficulty);
  
  // Expert 모드는 전체 입력
  if (difficulty === 'expert') {
    return {
      words: [],
      blanks: [],
      choices: undefined,
    };
  }
  
  // 중요 단어 인덱스 찾기
  const importantIndices = words
    .map((word, index) => ({ word, index }))
    .filter(({ word }) => isImportantWord(word))
    .map(({ index }) => index);
  
  // 빈칸으로 만들 인덱스 선택
  const selectedIndices: number[] = [];
  const shuffled = [...importantIndices].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < Math.min(blankCount, shuffled.length); i++) {
    selectedIndices.push(shuffled[i]);
  }
  
  // 빈칸 정보 생성
  const blanks: BlankWord[] = selectedIndices
    .sort((a, b) => a - b)
    .map(index => ({
      index,
      original: words[index],
      userAnswer: undefined,
    }));
  
  // Easy/Hard 모드: 보기 생성 (정답 반드시 포함 + 오답으로 나머지 채움)
  let choices: string[] | undefined;
  if (difficulty === 'easy' || difficulty === 'hard') {
    const correctAnswers = blanks.map(b => b.original);
    const wrongCount = Math.max(15 - correctAnswers.length, 4);
    const wrongAnswers = generateWrongAnswers(words, correctAnswers, wrongCount);
    choices = [...correctAnswers, ...wrongAnswers]
      .sort(() => Math.random() - 0.5);
  }
  
  return {
    words,
    blanks,
    choices,
  };
}

/**
 * 오답 보기 생성
 */
function generateWrongAnswers(
  allWords: string[],
  correctAnswers: string[],
  count: number
): string[] {
  // 정답에 없는 중요 단어를 오답 후보로 사용 (중복 제거)
  const correctSet = new Set(correctAnswers);
  const seen = new Set<string>();
  const candidates: string[] = [];

  for (const word of allWords) {
    if (!correctSet.has(word) && isImportantWord(word) && !seen.has(word)) {
      seen.add(word);
      candidates.push(word);
    }
  }

  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * 정답 체크 (오타 허용)
 */
export function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  const user = userAnswer.trim().toLowerCase();
  const correct = correctAnswer.trim().toLowerCase();
  
  // 완전 일치
  if (user === correct) return true;
  
  // 공백 제거 후 비교
  if (user.replace(/\s/g, '') === correct.replace(/\s/g, '')) return true;
  
  // 유사도 체크 (Levenshtein distance)
  const similarity = calculateSimilarity(user, correct);
  return similarity >= 0.8; // 80% 이상 유사하면 정답
}

/**
 * 문자열 유사도 계산 (Levenshtein distance)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;
  
  const matrix: number[][] = [];
  
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return 1 - distance / maxLen;
}

/**
 * 첫 글자 힌트 생성
 */
export function getHint(word: string): string {
  if (!word || word.length === 0) return '';
  return word[0] + '_'.repeat(word.length - 1);
}

/**
 * 전체 암송 체크
 */
export function checkFullRecitation(userText: string, correctText: string): {
  isCorrect: boolean;
  similarity: number;
} {
  const user = userText.trim().toLowerCase().replace(/\s+/g, ' ');
  const correct = correctText.trim().toLowerCase().replace(/\s+/g, ' ');
  
  const similarity = calculateSimilarity(user, correct);
  
  return {
    isCorrect: similarity >= 0.8,
    similarity,
  };
}

