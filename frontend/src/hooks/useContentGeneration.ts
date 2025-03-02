import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contentApi } from '../services/api';
import { GeneratedContent, GenerationRequest } from '../types/api';

export const useContentGeneration = () => {
  const queryClient = useQueryClient();
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);

  // コンテンツ生成
  const generateMutation = useMutation({
    mutationFn: (data: GenerationRequest) => {
      // analysis_resultsが含まれていない場合は、ダミーデータを追加
      const requestData = {
        ...data,
        analysis_results: {
          "top_results": [
            {
              "title": "SEO対策の基本ガイド",
              "url": "https://example.com/seo-guide",
              "content": "SEO対策の基本的な方法について解説します。"
            },
            {
              "title": "2023年最新SEO戦略",
              "url": "https://example.com/seo-strategy-2023",
              "content": "2023年に効果的なSEO戦略について詳しく説明します。"
            }
          ],
          "keyword_density": {
            "main_keyword": 2.5,
            "related_keywords": ["SEO", "検索エンジン", "ランキング"]
          },
          "meta_data": {
            "avg_title_length": 60,
            "avg_description_length": 155
          },
          "prompt": `
以下の情報を元に、SEO対策に関する記事を作成してください。
キーワード: ${data.keyword}
記事の構成:
1. はじめに - キーワードに関する一般的な説明
2. 主要なポイント - キーワードに関連する重要な情報
3. 実践的なアドバイス - 読者が実行できる具体的なステップ
4. まとめ - 主要なポイントの要約

記事は専門的でありながら、読みやすく、SEOに最適化されたものにしてください。
約1000〜1500文字で作成してください。
`
        }
      };
      return contentApi.generate(requestData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
  });

  // コンテンツ一覧取得
  const { data: contents, isLoading: isLoadingContents } = useQuery({
    queryKey: ['contents'],
    queryFn: () => contentApi.getContents(),
    enabled: true,
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
    deleteContent: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    error: generateMutation.error || deleteMutation.error,
  };
};
