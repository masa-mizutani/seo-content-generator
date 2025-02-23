import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contentApi } from '../services/api';
import { GeneratedContent, GenerationRequest } from '../types/api';

export const useContentGeneration = () => {
  const queryClient = useQueryClient();
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);

  // コンテンツ生成
  const generateMutation = useMutation({
    mutationFn: (data: GenerationRequest) => contentApi.generate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
  });

  // コンテンツ一覧取得
  const { data: contents, isLoading: isLoadingContents } = useQuery({
    queryKey: ['contents'],
    queryFn: () => contentApi.getContents(),
  });

  // コンテンツ更新
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<GeneratedContent> }) =>
      contentApi.updateContent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
  });

  // コンテンツ削除
  const deleteMutation = useMutation({
    mutationFn: (id: number) => contentApi.deleteContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
  });

  return {
    contents,
    isLoadingContents,
    selectedContent,
    setSelectedContent,
    generateContent: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
    updateContent: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteContent: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    error: generateMutation.error || updateMutation.error || deleteMutation.error,
  };
};
