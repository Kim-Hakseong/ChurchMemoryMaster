import { Link } from "wouter";
import { ChevronLeft, Download } from "lucide-react";
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
let CameraRoll: any = null;

export default function SplashPage() {
  const handleDownload = async () => {
    try {
      const isNative = Capacitor.isNativePlatform();
      const url = '/splash-image.jpg';
      const resp = await fetch(url, { cache: 'no-cache' });
      const blob = await resp.blob();
      if (isNative) {
        // 네이티브 저장
        const arrayBuffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        const base64String = btoa(binary);
        const fileName = `교육목표_${new Date().toISOString().slice(0,10)}.jpg`;
        // iOS: 파일 공유(Web Share Level 2)로 저장 유도 → '사진에 저장' 제공 기기 다수
        try {
          const blob = new Blob([Uint8Array.from(atob(base64String), c => c.charCodeAt(0))], { type: 'image/jpeg' });
          const file = new File([blob], `splash_${Date.now()}.jpg`, { type: 'image/jpeg' });
          if ((navigator as any).canShare?.({ files: [file] })) {
            await (navigator as any).share({ files: [file], title: '교육목표 이미지' });
            alert('공유 시트에서 저장을 완료해 주세요.');
            return;
          }
        } catch {}
        // 폴백: URL 공유 시트
        await Share.share({ title: '교육목표 이미지', url: `data:image/jpeg;base64,${base64String}` });
        alert('공유 시트에서 저장해주세요.');
        return;
      } else {
        // 웹 다운로드
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `교육목표_${new Date().toISOString().slice(0,10)}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        alert('이미지가 저장되었습니다.');
        return;
      }
    } catch (e) {
      console.error('이미지 저장 실패:', e);
      alert('이미지 저장에 실패했습니다. 권한/저장공간을 확인해 주세요.');
    }
  };
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-4 pt-14 pb-5 border-b bg-white/80 backdrop-blur z-10 grid grid-cols-3 items-center">
        <div className="justify-self-start">
          <Link href="/home">
            <a className="inline-flex items-center gap-1 text-gray-700 hover:text-gray-900">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">메인화면</span>
            </a>
          </Link>
        </div>
        <h1 className="text-lg font-semibold text-gray-900 text-center justify-self-center">교육목표</h1>
        <div className="justify-self-end">
          <button onClick={handleDownload} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white shadow border text-gray-700 hover:bg-gray-50 text-xs">
            <Download className="w-4 h-4" /> 저장
          </button>
        </div>
      </header>

      {/* Image body */}
      <main className="flex-1 relative">
        <div 
          className="absolute inset-0 bg-no-repeat bg-center"
          style={{
            backgroundImage: 'url(/splash-image.jpg), url(/splash-image.png)',
            backgroundSize: 'contain'
          }}
        />
      </main>
    </div>
  );
}


