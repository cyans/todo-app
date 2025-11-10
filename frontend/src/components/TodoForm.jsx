import React, { useState } from 'react';

export const TodoForm = ({ onAddTodo, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // title과 description을 합쳐서 text 필드로 전달
      const fullText = formData.description.trim()
        ? `${formData.title.trim()}\n\n${formData.description.trim()}`
        : formData.title.trim();

      await onAddTodo({
        text: fullText,
        priority: formData.priority,
        dueDate: formData.dueDate || null
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: ''
      });
    } catch (error) {
      console.error('Failed to add todo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-visible backdrop-blur-sm">
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              새로운 할 일
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              오늘의 목표를 설정해보세요
            </p>
          </div>

          {/* 메인 입력 영역 */}
          <div className="space-y-4">
            {/* 할 일 입력 */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <span className="text-gray-400 text-xl">📝</span>
              </div>
              <div className="flex-1 relative">
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="무엇을 해야 하나요?"
                  className="w-full max-w-2xl px-4 py-4 text-lg font-medium text-gray-900 dark:text-white
                           placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800
                           border-2 border-gray-200 dark:border-gray-600 rounded-xl
                           focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                           shadow-sm hover:shadow-md box-border"
                  disabled={isSubmitting || loading}
                  maxLength={100}
                  autoComplete="off"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* 세부내역 입력 */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 pt-4">
                <span className="text-gray-400 text-xl">📄</span>
              </div>
              <div className="flex-1">
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="더 자세한 내용이 있다면 적어주세요 (선택사항)"
                  rows="3"
                  className="w-full max-w-2xl px-4 py-4 text-base font-normal text-gray-900 dark:text-white
                           placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800
                           border-2 border-gray-200 dark:border-gray-600 rounded-xl
                           focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                           resize-none shadow-sm hover:shadow-md box-border"
                  disabled={isSubmitting || loading}
                  maxLength={500}
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          {/* 옵션 및 추가 버튼 영역 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-visible">
            {/* 마감일 선택 */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <span>📅</span>
                  <span>마감일</span>
                </span>
              </label>
              <div className="relative z-50">
                <input
                  id="dueDate"
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full max-w-2xl px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300
                           bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl
                           focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                           shadow-sm hover:shadow-md box-border"
                  disabled={isSubmitting || loading}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* 중요도 선택 */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <span>⚡</span>
                  <span>중요도</span>
                </span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: 'low' }))}
                  className={`flex-1 px-3 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200
                    ${formData.priority === 'low'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-green-300 dark:hover:border-green-700'
                    }`}
                  disabled={isSubmitting || loading}
                >
                  낮음
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: 'medium' }))}
                  className={`flex-1 px-3 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200
                    ${formData.priority === 'medium'
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-yellow-300 dark:hover:border-yellow-700'
                    }`}
                  disabled={isSubmitting || loading}
                >
                  보통
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: 'high' }))}
                  className={`flex-1 px-3 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200
                    ${formData.priority === 'high'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-red-300 dark:hover:border-red-700'
                    }`}
                  disabled={isSubmitting || loading}
                >
                  높음
                </button>
              </div>
            </div>

            {/* 추가 버튼 */}
            <div className="lg:col-span-1 flex items-end">
              <button
                type="submit"
                disabled={!formData.title.trim() || isSubmitting || loading}
                className="w-full px-6 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
                         dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600
                         rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]
                         flex items-center justify-center gap-3 min-h-[56px]"
                title="할 일 추가"
              >
                <span className="text-xl">{isSubmitting ? '⏳' : '✨'}</span>
                <span>{isSubmitting ? '추가 중...' : '할 일 추가하기'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default TodoForm;