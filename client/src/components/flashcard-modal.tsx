import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb, CheckCircle, XCircle, ArrowRight, RotateCcw, Mic } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  generateBlanks,
  checkAnswer,
  checkFullRecitation,
  getHint,
  type DifficultyLevel,
  type BlankWord,
  type FlashcardData,
} from "@/lib/flashcard-utils";
import type { Verse } from "@shared/schema";
import { useProgress } from "@/hooks/use-progress";
import PointsEarnedToast from "@/components/points-earned-toast";

interface FlashcardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  verse: Verse;
}

type Stage = 'select' | 'playing' | 'complete';

// 부서 포인트 컬러 매핑 — 쉬움=유치(피치), 보통=초등(민트), 완전=중고등(라벤더)
const DIFFICULTY_CONFIG = {
  easy: {
    label: '쉬움',
    tag: '선택형',
    description: '빈칸 3-5개를 보기에서 선택',
    accentColor: 'var(--dept-kg-accent)', // 유치부 피치
  },
  hard: {
    label: '보통',
    tag: '선택형',
    description: '빈칸 7-10개를 보기에서 선택',
    accentColor: 'var(--dept-el-accent)', // 초등부 민트
  },
  expert: {
    label: '완전 암송',
    tag: '직접 입력',
    description: '전체 구절을 직접 입력 또는 음성',
    accentColor: 'var(--dept-yt-accent)', // 중고등부 라벤더
  },
};

export default function FlashcardModal({ open, onOpenChange, verse }: FlashcardModalProps) {
  const [stage, setStage] = useState<Stage>('select');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [flashcardData, setFlashcardData] = useState<FlashcardData | null>(null);
  const [selectedBlankIndex, setSelectedBlankIndex] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Map<number, string>>(new Map());
  const [usedChoiceIndices, setUsedChoiceIndices] = useState<Set<number>>(new Set());
  const [showHints, setShowHints] = useState<Map<number, boolean>>(new Map());
  const [fullRecitationText, setFullRecitationText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();
  const { recordCompletion, lastPoints, newBadges, clearNewBadges } = useProgress();
  const [showPoints, setShowPoints] = useState(false);

  useEffect(() => {
    if (open) {
      setStage('select');
      setDifficulty('easy');
      reset();
    }
  }, [open]);

  const reset = () => {
    setFlashcardData(null);
    setSelectedBlankIndex(null);
    setUserAnswers(new Map());
    setUsedChoiceIndices(new Set());
    setShowHints(new Map());
    setFullRecitationText('');
    setIsRecording(false);
    setShowPoints(false);
    clearNewBadges();
  };

  const handleStart = (selectedDifficulty: DifficultyLevel) => {
    setDifficulty(selectedDifficulty);
    const data = generateBlanks(verse.content, selectedDifficulty);
    setFlashcardData(data);
    setStage('playing');
  };

  const handleChoiceClick = (choice: string) => {
    if (selectedBlankIndex === null || !flashcardData) return;

    const blank = flashcardData.blanks[selectedBlankIndex];
    const isCorrect = checkAnswer(choice, blank.original);

    if (isCorrect) {
      const newAnswers = new Map(userAnswers);
      newAnswers.set(selectedBlankIndex, choice);
      setUserAnswers(newAnswers);

      // 사용한 보기를 인덱스로 추적 (같은 단어가 여러 번 있어도 개별 관리)
      const choiceIdx = flashcardData.choices!.findIndex(
        (c, i) => c === choice && !usedChoiceIndices.has(i)
      );
      if (choiceIdx !== -1) {
        setUsedChoiceIndices(new Set(Array.from(usedChoiceIndices).concat([choiceIdx])));
      }
      setSelectedBlankIndex(null);

      toast({
        title: "정답! 🎉",
        description: "잘했어요!",
      });

      // 모두 맞췄는지 확인
      if (newAnswers.size === flashcardData.blanks.length) {
        setTimeout(() => handleComplete(), 500);
      }
    } else {
      toast({
        title: "다시 생각해보세요 💭",
        description: "힌트를 사용해보세요!",
        variant: "destructive",
      });
    }
  };

  const handleBlankInput = (blankIndex: number, value: string) => {
    const newAnswers = new Map(userAnswers);
    newAnswers.set(blankIndex, value);
    setUserAnswers(newAnswers);
  };

  const handleCheckHardMode = () => {
    if (!flashcardData) return;

    let allCorrect = true;
    const incorrectIndices: number[] = [];

    flashcardData.blanks.forEach((blank, idx) => {
      const userAnswer = userAnswers.get(idx) || '';
      if (!checkAnswer(userAnswer, blank.original)) {
        allCorrect = false;
        incorrectIndices.push(idx);
      }
    });

    if (allCorrect) {
      toast({
        title: "완벽합니다! 🎉",
        description: "모든 답을 맞췄어요!",
      });
      setTimeout(() => handleComplete(), 500);
    } else {
      toast({
        title: `${incorrectIndices.length}개 틀렸어요 💭`,
        description: "다시 확인해보세요!",
        variant: "destructive",
      });
    }
  };

  const handleCheckExpertMode = () => {
    const result = checkFullRecitation(fullRecitationText, verse.content);

    if (result.isCorrect) {
      toast({
        title: "완벽한 암송! 🏆",
        description: `정확도: ${Math.round(result.similarity * 100)}%`,
      });
      setTimeout(() => handleComplete(), 500);
    } else {
      toast({
        title: "조금 더 연습이 필요해요 💪",
        description: `정확도: ${Math.round(result.similarity * 100)}% (80% 이상 필요)`,
        variant: "destructive",
      });
    }
  };

  const handleComplete = async () => {
    setStage('complete');

    try {
      await recordCompletion(verse, difficulty);
      setShowPoints(true);
    } catch {
      // 포인트 저장 실패해도 완료 처리
    }

    toast({
      title: "암송 완료!",
      description: "잘 하셨습니다!",
    });
  };

  const toggleHint = (blankIndex: number) => {
    const newHints = new Map(showHints);
    newHints.set(blankIndex, !showHints.get(blankIndex));
    setShowHints(newHints);
  };

  // 음성 인식 시작
  const handleStartRecording = async () => {
    try {
      // Web Speech API 확인
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        toast({
          title: "음성 인식 불가",
          description: "이 기기는 음성 인식을 지원하지 않습니다.",
          variant: "destructive",
        });
        return;
      }

      const recognition = new SpeechRecognition();
      
      recognition.lang = 'ko-KR';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        toast({
          title: "음성 인식 시작 🎤",
          description: "지금 암송해주세요!",
        });
      };

      recognition.onresult = (event: any) => {
        try {
          const transcript = event.results[0][0].transcript;
          setFullRecitationText(transcript);
          toast({
            title: "음성 인식 완료",
            description: "텍스트로 변환되었습니다.",
          });
        } catch (error) {
          console.error('음성 인식 결과 처리 오류:', error);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('음성 인식 오류:', event.error);
        setIsRecording(false);
        
        let errorMessage = "다시 시도해주세요.";
        if (event.error === 'no-speech') {
          errorMessage = "음성이 감지되지 않았습니다.";
        } else if (event.error === 'audio-capture') {
          errorMessage = "마이크를 사용할 수 없습니다.";
        } else if (event.error === 'not-allowed') {
          errorMessage = "마이크 권한이 필요합니다.";
        }
        
        toast({
          title: "음성 인식 오류",
          description: errorMessage,
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (error) {
      console.error('음성 인식 시작 오류:', error);
      setIsRecording(false);
      toast({
        title: "음성 인식 오류",
        description: "음성 인식을 시작할 수 없습니다.",
        variant: "destructive",
      });
    }
  };

  const renderSelectStage = () => (
    <div className="px-6 py-5">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900">암송 연습</h2>
        <p className="text-xs text-gray-400 mt-0.5">난이도를 선택하세요</p>
      </div>

      <div className="space-y-2.5">
        {(Object.keys(DIFFICULTY_CONFIG) as DifficultyLevel[]).map((level) => {
          const config = DIFFICULTY_CONFIG[level];
          return (
            <button
              key={level}
              onClick={() => handleStart(level)}
              className="w-full text-left p-3.5 rounded-xl bg-white border border-gray-100
                hover:shadow-md hover:border-gray-200 active:scale-[0.98]
                transition-all duration-200 group"
              style={{ borderLeftWidth: '4px', borderLeftColor: config.accentColor }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold text-gray-900">{config.label}</span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      {config.tag}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{config.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 px-3 py-2.5 rounded-lg bg-gray-50/80">
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{verse.content}</p>
        <p className="text-[11px] text-gray-400 mt-1">{verse.reference}</p>
      </div>
    </div>
  );

  const renderEasyMode = () => {
    if (!flashcardData) return null;

    return (
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">쉬움 모드</h3>
          <span className="text-sm text-gray-600">
            {userAnswers.size} / {flashcardData.blanks.length}
          </span>
        </div>

        {/* 문장 표시 */}
        <div className="p-4 bg-white rounded-lg border-2 border-gray-200 min-h-[120px]">
          <div className="flex flex-wrap gap-2 items-center">
            {flashcardData.words.map((word, idx) => {
              const blankIdx = flashcardData.blanks.findIndex(b => b.index === idx);
              
              if (blankIdx !== -1) {
                const isSelected = selectedBlankIndex === blankIdx;
                const userAnswer = userAnswers.get(blankIdx);
                const blank = flashcardData.blanks[blankIdx];

                return (
                  <motion.button
                    key={idx}
                    onClick={() => setSelectedBlankIndex(isSelected ? null : blankIdx)}
                    className={`px-3 py-1 rounded-md border-2 font-medium transition-all ${
                      userAnswer
                        ? 'bg-green-100 border-green-400 text-green-700'
                        : isSelected
                        ? 'bg-blue-100 border-blue-400 text-blue-700 ring-2 ring-blue-300'
                        : 'bg-gray-100 border-gray-300 text-gray-500 hover:border-blue-300'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {userAnswer || '___'}
                  </motion.button>
                );
              }

              return (
                <span key={idx} className="text-gray-800">
                  {word}
                </span>
              );
            })}
          </div>
        </div>

        {/* 보기 */}
        {selectedBlankIndex !== null && flashcardData.choices && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-blue-50 rounded-lg"
          >
            <p className="text-sm font-semibold text-blue-700 mb-3">보기를 선택하세요:</p>
            <div className="grid grid-cols-3 gap-2">
              {flashcardData.choices
                .map((choice, idx) => ({ choice, idx }))
                .filter(({ idx }) => !usedChoiceIndices.has(idx))
                .map(({ choice, idx }) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleChoiceClick(choice)}
                    className="px-3 py-2 bg-white border-2 border-blue-200 rounded-md hover:border-blue-400 hover:bg-blue-50 transition-all"
                  >
                    {choice}
                  </motion.button>
                ))}
            </div>
          </motion.div>
        )}

        <p className="text-xs text-center text-gray-500 mt-4">
          빈칸을 클릭한 후 알맞은 보기를 선택하세요
        </p>
      </div>
    );
  };

  const renderHardMode = () => {
    if (!flashcardData) return null;

    return (
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">보통 모드</h3>
          <span className="text-sm text-gray-600">
            {userAnswers.size} / {flashcardData.blanks.length}
          </span>
        </div>

        {/* 문장 표시 - 쉬움과 같은 형식 */}
        <div className="p-4 bg-white rounded-lg border-2 border-gray-200 min-h-[120px]">
          <div className="flex flex-wrap gap-2 items-center">
            {flashcardData.words.map((word, idx) => {
              const blankIdx = flashcardData.blanks.findIndex(b => b.index === idx);
              
              if (blankIdx !== -1) {
                const isSelected = selectedBlankIndex === blankIdx;
                const userAnswer = userAnswers.get(blankIdx);
                const blank = flashcardData.blanks[blankIdx];

                return (
                  <motion.button
                    key={idx}
                    onClick={() => setSelectedBlankIndex(isSelected ? null : blankIdx)}
                    className={`px-3 py-1 rounded-md border-2 font-medium transition-all ${
                      userAnswer
                        ? 'bg-green-100 border-green-400 text-green-700'
                        : isSelected
                        ? 'bg-orange-100 border-orange-400 text-orange-700 ring-2 ring-orange-300'
                        : 'bg-gray-100 border-gray-300 text-gray-500 hover:border-orange-300'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {userAnswer || '___'}
                  </motion.button>
                );
              }

              return (
                <span key={idx} className="text-gray-800">
                  {word}
                </span>
              );
            })}
          </div>
        </div>

        {/* 보기 */}
        {selectedBlankIndex !== null && flashcardData.choices && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-orange-50 rounded-lg"
          >
            <p className="text-sm font-semibold text-orange-700 mb-3">보기를 선택하세요:</p>
            <div className="grid grid-cols-3 gap-2">
              {flashcardData.choices
                .map((choice, idx) => ({ choice, idx }))
                .filter(({ idx }) => !usedChoiceIndices.has(idx))
                .map(({ choice, idx }) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleChoiceClick(choice)}
                    className="px-3 py-2 bg-white border-2 border-orange-200 rounded-md hover:border-orange-400 hover:bg-orange-50 transition-all"
                  >
                    {choice}
                  </motion.button>
                ))}
            </div>
          </motion.div>
        )}

        <p className="text-xs text-center text-gray-500 mt-4">
          빈칸을 클릭한 후 알맞은 보기를 선택하세요 (더 많은 빈칸!)
        </p>
      </div>
    );
  };

  const renderExpertMode = () => (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">완전 암송 모드</h3>
      </div>

      <div className="p-4 bg-teal-50 rounded-lg mb-4">
        <p className="text-sm text-teal-700 font-semibold mb-2">암송할 구절:</p>
        <p className="text-sm text-gray-600">{verse.reference}</p>
      </div>

      <div className="relative">
        <Textarea
          placeholder="전체 구절을 입력하거나 음성으로 암송하세요..."
          value={fullRecitationText}
          onChange={(e) => setFullRecitationText(e.target.value)}
          rows={6}
          className="resize-none pr-12"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleStartRecording}
          disabled={isRecording}
          className={`absolute bottom-2 right-2 ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : ''}`}
          title="음성으로 암송하기"
        >
          <Mic className={`w-5 h-5 ${isRecording ? 'text-red-600' : ''}`} />
        </Button>
      </div>

      <Button
        onClick={handleCheckExpertMode}
        className="w-full"
        disabled={!fullRecitationText.trim()}
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        암송 확인
      </Button>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 text-center">
          {isRecording ? '🎤 음성 인식 중...' : '💡 전체 구절을 입력 또는 음성으로 암송하세요 (80% 이상 유사하면 통과)'}
        </p>
      </div>
    </div>
  );

  const renderCompleteStage = () => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6 p-6 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">완료</h2>
          <p className="text-sm text-gray-500">암송을 완료했습니다</p>
        </motion.div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-gray-500 mb-2">난이도</p>
            <p className="font-semibold text-lg">{DIFFICULTY_CONFIG[difficulty].label}</p>
          </div>
        </div>

        <PointsEarnedToast points={lastPoints} newBadges={newBadges} show={showPoints} />

        <div className="space-y-2">
          <Button
            onClick={() => {
              reset();
              setStage('select');
            }}
            className="w-full flashcard-dark-cta"
            style={{
              background: '#1a1a1a',
              color: '#ffffff',
              border: 'none',
            }}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            다시 도전하기
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full"
            style={{
              background: '#ffffff',
              color: '#1a1a1a',
              border: '1.5px solid #1a1a1a',
            }}
          >
            완료
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto flashcard-force-light">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>

        <AnimatePresence mode="wait">
          {stage === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {renderSelectStage()}
            </motion.div>
          )}

          {stage === 'playing' && difficulty === 'easy' && (
            <motion.div
              key="easy"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {renderEasyMode()}
            </motion.div>
          )}

          {stage === 'playing' && difficulty === 'hard' && (
            <motion.div
              key="hard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {renderHardMode()}
            </motion.div>
          )}

          {stage === 'playing' && difficulty === 'expert' && (
            <motion.div
              key="expert"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {renderExpertMode()}
            </motion.div>
          )}

          {stage === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {renderCompleteStage()}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

