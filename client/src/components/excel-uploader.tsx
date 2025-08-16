import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ExcelParser } from "@/lib/excel-parser";
import { useQueryClient } from "@tanstack/react-query";

interface ExcelUploaderProps {
  onUploadComplete?: () => void;
}

export default function ExcelUploader({ onUploadComplete }: ExcelUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "파일 형식 오류",
        description: "Excel 파일(.xlsx, .xls)만 업로드할 수 있습니다.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus("idle");

    try {
      await ExcelParser.parseFile(file);
      setUploadStatus("success");
      
      // Invalidate all verse and event queries
      queryClient.invalidateQueries({ queryKey: ['verses'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-verses'] });
      queryClient.invalidateQueries({ queryKey: ['verses-stats'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      
      toast({
        title: "업로드 완료",
        description: "Excel 파일이 성공적으로 업로드되었습니다.",
      });
      
      onUploadComplete?.();
    } catch (error) {
      console.error('Excel parsing error:', error);
      setUploadStatus("error");
      
      toast({
        title: "업로드 실패",
        description: error instanceof Error ? error.message : "파일 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const loadSampleData = async () => {
    setIsUploading(true);
    
    try {
      // 샘플 데이터 로드 기능 제거 - attached_assets 폴더 기반으로 변경됨
      setUploadStatus("success");
      
      // Invalidate all queries
      queryClient.invalidateQueries({ queryKey: ['verses'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-verses'] });
      queryClient.invalidateQueries({ queryKey: ['verses-stats'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      
      toast({
        title: "데이터 로드 완료",
        description: "attached_assets 폴더의 데이터가 로드되었습니다.",
      });
      
      onUploadComplete?.();
    } catch (error) {
      console.error('Data loading error:', error);
      setUploadStatus("error");
      
      toast({
        title: "데이터 로드 실패",
        description: "데이터 로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="verse-card text-center"
    >
      <FileSpreadsheet className="w-16 h-16 text-primary mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Excel 파일 업로드</h3>
      <p className="text-sm text-gray-600 mb-6">
        연령별 암송 말씀이 정리된 Excel 파일을 업로드해주세요.
      </p>

      <div className="space-y-3">
        <div className="relative">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <Button
            disabled={isUploading}
            className="w-full bg-primary hover:opacity-90"
          >
            {isUploading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 mr-2"
              >
                <Upload className="w-4 h-4" />
              </motion.div>
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {isUploading ? "업로드 중..." : "Excel 파일 선택"}
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">또는</span>
          </div>
        </div>

        {/* 샘플 데이터 로드 버튼 제거 */}

      </div>

      {uploadStatus === "success" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center justify-center text-accent"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">업로드 완료!</span>
        </motion.div>
      )}

      {uploadStatus === "error" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center justify-center text-destructive"
        >
          <AlertCircle className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">업로드 실패</span>
        </motion.div>
      )}
    </motion.div>
  );
}
