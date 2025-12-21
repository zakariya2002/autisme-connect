'use client';

import { useState } from 'react';

interface FeedbackQuestionProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  category: string;
  score: number | null;
  comment: string;
  onScoreChange: (score: number) => void;
  onCommentChange: (comment: string) => void;
}

export default function FeedbackQuestion({
  questionNumber,
  totalQuestions,
  question,
  category,
  score,
  comment,
  onScoreChange,
  onCommentChange,
}: FeedbackQuestionProps) {
  const [showComment, setShowComment] = useState(!!comment);

  // Couleur basée sur le score (rouge -> orange -> vert)
  const getScoreColor = (value: number): string => {
    if (value <= 3) return '#ef4444'; // Rouge
    if (value <= 5) return '#f97316'; // Orange
    if (value <= 7) return '#eab308'; // Jaune
    return '#22c55e'; // Vert
  };

  // Emoji basé sur le score
  const getScoreEmoji = (value: number | null): string => {
    if (value === null) return '🤔';
    if (value <= 2) return '😞';
    if (value <= 4) return '😕';
    if (value <= 6) return '😐';
    if (value <= 8) return '🙂';
    return '😄';
  };

  // Texte descriptif du score
  const getScoreLabel = (value: number | null): string => {
    if (value === null) return 'Glissez pour noter';
    if (value <= 2) return 'Très insatisfait';
    if (value <= 4) return 'Insatisfait';
    if (value <= 6) return 'Neutre';
    if (value <= 8) return 'Satisfait';
    return 'Très satisfait';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
      {/* Header avec numéro et catégorie */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{ backgroundColor: '#e6f4f4', color: '#027e7e' }}
        >
          Question {questionNumber}/{totalQuestions}
        </span>
        <span className="text-sm text-gray-500">{category}</span>
      </div>

      {/* Question */}
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">
        {question}
      </h3>

      {/* Score display */}
      <div className="text-center mb-4">
        <div className="text-5xl mb-2">{getScoreEmoji(score)}</div>
        <div
          className="text-3xl font-bold mb-1"
          style={{ color: score !== null ? getScoreColor(score) : '#9ca3af' }}
        >
          {score !== null ? score : '-'}/10
        </div>
        <div className="text-sm text-gray-500">{getScoreLabel(score)}</div>
      </div>

      {/* Slider */}
      <div className="relative mb-6">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Pas du tout</span>
          <span>Tout à fait</span>
        </div>

        {/* Custom slider track */}
        <div className="relative h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-150"
            style={{
              width: score !== null ? `${score * 10}%` : '0%',
              background: score !== null
                ? `linear-gradient(90deg, #ef4444 0%, #f97316 30%, #eab308 50%, #22c55e 100%)`
                : '#e5e7eb',
            }}
          />
        </div>

        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={score ?? 5}
          onChange={(e) => onScoreChange(parseInt(e.target.value))}
          className="absolute top-0 left-0 w-full h-3 opacity-0 cursor-pointer"
          style={{ marginTop: '18px' }}
        />

        {/* Score markers */}
        <div className="flex justify-between mt-2">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              onClick={() => onScoreChange(num)}
              className={`w-6 h-6 rounded-full text-xs font-medium transition-all ${
                score === num
                  ? 'text-white shadow-md scale-110'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
              style={{
                backgroundColor: score === num ? getScoreColor(num) : 'transparent',
              }}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle commentaire */}
      {!showComment ? (
        <button
          onClick={() => setShowComment(true)}
          className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: '#027e7e' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un commentaire (optionnel)
        </button>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Votre commentaire (optionnel)
          </label>
          <textarea
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Dites-nous en plus sur votre expérience..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-500 resize-none transition-all"
          />
          <button
            onClick={() => {
              setShowComment(false);
              onCommentChange('');
            }}
            className="text-sm text-gray-400 hover:text-gray-600 mt-2"
          >
            Retirer le commentaire
          </button>
        </div>
      )}
    </div>
  );
}
