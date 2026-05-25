import { Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { captureScreen } from "@/lib/capture-utils";

export default function CaptureButton() {
  const { toast } = useToast();

  const handleCapture = async () => {
    try {
      await captureScreen();
      toast({
        title: "화면 캡처 완료",
        description: "화면이 성공적으로 캡처되었습니다.",
      });
    } catch (error) {
      toast({
        title: "캡처 실패",
        description: "화면 캡처에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <button
      onClick={handleCapture}
      className="w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
      data-capture-button="true"
      title="화면 캡처"
      style={{ background: 'var(--surface-muted)', color: 'var(--ink-soft)' }}
    >
      <Camera className="w-4 h-4" />
    </button>
  );
}