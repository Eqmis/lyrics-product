import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import './summary.css'

const Summary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { questions, total } = location.state || {
    questions: [],
    total: 0
  };
  console.log(questions)
  const findPairedUnderscoreKeys = (obj) => {
    const result = {};
    Object.keys(obj).forEach((key) => {
      if (key.startsWith("_")) {
        const pairedKey = key.slice(1); // 去掉前面的 _
        if (pairedKey in obj) {
          result.underscoreValue = obj[key]
          result.normalValue = obj[pairedKey]
        }
      }
    });
    return result;
  }
  if (!questions) {
    return (
      <div className="p-8">
        <h2>无题目数据，请从答题页面进入</h2>
        <Button type="primary" onClick={() => navigate('/')}>返回首页</Button>
      </div>
    );
  }

  return (
    <div className="submit-page">
      <div className="submit-result">你最终得分：{total}</div>

      <div className="summary-list">
        {questions.map((q, i) => {
          const answer = findPairedUnderscoreKeys(q.fillRandom) || {};
          const isCorrect = answer.normalValue === answer.underscoreValue;

          return (
            <div
              key={i}
              className={`summary-item ${isCorrect ? "correct" : "wrong"}`}
            >
              <div><strong>第 {i + 1} 题</strong></div>
              <div>是否正确：{isCorrect ? "✅ 正确" : "❌ 错误"}</div>
              <div>你的答案：{answer.normalValue || "（未作答）"}</div>
              <div>正确答案：{q.answerText}</div>
            </div>
          );
        })}
      </div>

      <button className="summary-button" onClick={() => navigate("/")}>
        返回首页
      </button>
    </div>
  );
};

export default Summary;