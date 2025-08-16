import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // 이미지 로드 확인 (PNG 우선, JPG 폴백)
    const tryLoadImage = (src: string) => {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.onerror = () => {
        if (src.endsWith('.png')) {
          // PNG 실패시 JPG 시도
          tryLoadImage('/splash-image.jpg');
        } else {
          // JPG도 실패시 에러 처리
          setImageError(true);
        }
      };
      img.src = src;
    };
    
    tryLoadImage('/splash-image.png');
  }, []);

  useEffect(() => {
    // 2.5초 후 페이드아웃 시작
    const timer = setTimeout(() => {
      setIsVisible(false);
      // 페이드아웃 애니메이션 완료 후 onComplete 호출
      setTimeout(onComplete, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 w-full h-full z-50"
      style={{ width: '100%', height: '100%' }}
    >
      {/* 배경 이미지 또는 fallback */}
      {!imageError ? (
        <>
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: 'url(/splash-image.jpg), url(/splash-image.png)',
              backgroundSize: 'contain',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat'
            }}
            onError={() => setImageError(true)}
          />
          {/* 세련된 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
          
          {/* 로고/제목 오버레이 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute top-8 left-0 right-0 text-center"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl mx-8 py-4 px-6 shadow-xl">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">교회학교 암송 말씀</h1>
              <p className="text-sm text-gray-600">Church Memory Master</p>
            </div>
          </motion.div>
        </>
      ) : (
        // Fallback 배경 (이미지 로드 실패시)
        <div className="w-full h-full bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700">
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center text-white px-6"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
                <h1 className="text-3xl font-bold mb-6 text-yellow-200">* 교회학교 교육목표 *</h1>
                <p className="text-xl mb-3 font-medium">하나님을 경외하고</p>
                <p className="text-xl mb-6 font-medium">그 명령을 지킬지어다</p>
                <p className="text-sm text-blue-200 font-medium">전도서 12:13</p>
              </div>
            </motion.div>
          </div>
        </div>
      )}
      
      {/* 업그레이드된 로딩 인디케이터 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-4 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2.5 h-2.5 bg-blue-500 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
            <span className="text-sm text-gray-700 font-medium">로딩 중...</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 