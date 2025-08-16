import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <Button
      onClick={handleCapture}
      size="sm"
      variant="outline"
      className="fixed top-10 right-4 z-50 bg-white/80 backdrop-blur-lg border border-gray-200 hover:bg-white/90 shadow-lg flex items-center justify-center min-w-[80px] h-8 active:scale-100 active:transform-none"
      data-capture-button="true"
    >
      <Camera className="w-4 h-4 mr-2 flex-shrink-0" />
      <span className="text-sm font-medium">캡처</span>
    </Button>
  );
}