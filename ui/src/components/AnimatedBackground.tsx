import React from 'react';

const GeometricBackground = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-pink-50">
          {/* 큰 도형들 */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-pink-200 rotate-45 opacity-60 animate-float" />
          <div className="absolute top-1/3 -left-20 w-80 h-80 bg-pink-300 rounded-3xl rotate-12 opacity-60 animate-float-delayed" />
          
          {/* 작은 도형들 */}
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-pink-400 rotate-45 opacity-70 animate-float-slow" />
          <div className="absolute bottom-1/3 left-1/3 w-40 h-40 bg-pink-200 rounded-full opacity-65 animate-float-reverse" />
          
          {/* 추가적인 기하학적 요소들 */}
          <div className="absolute top-1/2 right-1/3 w-24 h-24 border-8 border-pink-300 rotate-12 opacity-70 animate-float-delayed-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-36 h-36 bg-pink-200 clip-triangle opacity-60 animate-float" />
          
          {/* 장식용 점들 */}
          <div className="absolute top-20 left-1/4 w-4 h-4 bg-pink-400 rounded-full opacity-70" />
          <div className="absolute bottom-32 right-1/2 w-6 h-6 bg-pink-300 rounded-full opacity-70" />
          <div className="absolute top-1/2 right-20 w-3 h-3 bg-pink-400 rounded-full opacity-70" />
          
          {/* 선형 요소 */}
          <div className="absolute top-1/4 left-20 w-32 h-1 bg-pink-300 rotate-45 opacity-60" />
          <div className="absolute bottom-1/3 right-40 w-40 h-1 bg-pink-200 -rotate-12 opacity-60" />
        </div>
      );
    };

export default GeometricBackground;
