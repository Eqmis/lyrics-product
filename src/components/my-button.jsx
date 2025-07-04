import React from 'react';

// 通过 props 接收自定义文本、点击事件、样式等
const Button = ({ children, onClick, type = 'button', className = '' }) => {
 return (
  <button
   type={type}
   onClick={onClick}
   className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${className}`}
  >
   {children}
  </button>
 );
};

export default Button;