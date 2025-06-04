import React, { useEffect, useState, useRef } from 'react';
import { getRandomItems } from "../utils/utils";
import lyricsArr from "../../lyrics.json";
import { useNavigate } from 'react-router-dom';
import "./home.css";

const FALSECOUNT = 3;

const Home = () => {
  const navigate = useNavigate();
  const [lyricsData, setlyricsData] = useState([]);
  const [lyricsAnswerArr, setLyricsAnswerArr] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    let arr = getRandomItems(lyricsArr, 20).map(item => item.value);
    let result = resetLyricsArr(arr);
    setlyricsData(result);
    setLyricsAnswerArr(generateQuestionChoices(result, lyricsArr.join().split(',')));
  }, []);

  // 跳转分数页面
  const handleSubmit = () => {
    const result = {
      total: calculateScore(),
      questions: lyricsData,
    };

    navigate('/summary', { state: result });
  };

  // 🛠 修复滚动更新 currentIndex
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const index = Math.round(container.scrollLeft / container.offsetWidth);
      setCurrentIndex(index);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const generateQuestionChoices = (questions, choicePool) => {
    return questions.map(q => {
      const correct = Object.entries(q.fillRandom).find(([key]) => key.startsWith("_"))?.[1];
      if (!correct) return null;
      const wrongPool = choicePool.filter(item => item !== correct);
      const wrongs = [];
      while (wrongs.length < FALSECOUNT && wrongPool.length > 0) {
        const i = Math.floor(Math.random() * wrongPool.length);
        const candidate = wrongPool.splice(i, 1)[0];
        if (!wrongs.includes(candidate)) {
          wrongs.push(candidate);
        }
      }
      const options = [correct, ...wrongs].sort(() => Math.random() - 0.5);
      return { correct, options };
    }).filter(Boolean);
  };

  const resetLyricsArr = (questions) => {
    if (!Array.isArray(questions)) return [];
    return questions.map(question => {
      const length = question.length;
      const answerText = question.join(',');
      const fillRandom = {};
      let positionKeys = length === 2 ? ['left', 'right'] : ['left', 'middle', 'right'];
      const randomIndex = Math.floor(Math.random() * positionKeys.length);
      positionKeys.forEach((key, idx) => {
        if (idx === randomIndex) {
          fillRandom['_' + key] = question[idx]; // 正确答案隐藏
          fillRandom[key] = ''; // 显示为空
        } else {
          fillRandom[key] = question[idx];
        }
      });
      return { length, answerText, fillRandom, index: randomIndex };
    }).filter(Boolean);
  };

  const scrollToIndex = (index) => {
    if (!containerRef.current) return;
    const width = containerRef.current.offsetWidth;
    containerRef.current.scrollTo({
      left: index * width,
      behavior: 'smooth',
    });
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < lyricsData.length) {
      scrollToIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  const handleOptionClick = (option) => {
    const data = [...lyricsData];
    const answers = [...lyricsAnswerArr];

    const current = data[currentIndex];
    const fillKey = Object.keys(current.fillRandom).find(
      key => key.startsWith('_') && !current.fillRandom[key.slice(1)]
    )?.slice(1);

    if (!fillKey) return;

    current.fillRandom[fillKey] = option;
    answers[currentIndex].options = answers[currentIndex].options.filter(opt => opt !== option);

    setlyricsData(data);
    setLyricsAnswerArr(answers);
  };

  const isAllAnswered = () => {
    return lyricsData.every((item) => {
      const fillKeys = Object.entries(item.fillRandom)
        .filter(([key]) => !key.startsWith('_')); // 只看可见字段

      return fillKeys.every(([key, value]) => value && value.trim() !== '');
    });
  };


  const handleFilledClick = (pos) => {
    const data = [...lyricsData];
    const answers = [...lyricsAnswerArr];

    const current = data[currentIndex];

    // 判断当前位置是不是填空位置（即存在 _pos 字段）
    if (!('_' + pos in current.fillRandom)) return;

    const filled = current.fillRandom[pos];
    if (!filled) return;

    // 清空填空内容
    current.fillRandom[pos] = '';

    // 恢复到选项池
    answers[currentIndex].options.push(filled);

    setlyricsData(data);
    setLyricsAnswerArr(answers);
  };
  const calculateScore = () => {
    let total = 0;

    lyricsData.forEach((item, i) => {
      const correct = lyricsAnswerArr[i]?.correct;
      const userAnswer = Object.entries(item.fillRandom).find(
        ([key]) => !key.startsWith('_') && item.fillRandom[key] === correct
      );

      if (userAnswer) {
        total += 5;
      }
    });

    return total;
  };

  return (
    <div className="lyrics-slider-wrapper">
      {
        currentIndex !== 20 && <div className="lyrics-header">
          <button className="lyrics-button" onClick={handlePrev} disabled={currentIndex === 0}>⬆️ 上一题</button>
          <span>{currentIndex + 1} / {lyricsData.length}</span>
          <button className="lyrics-button" onClick={handleNext} disabled={currentIndex === lyricsData.length - 1}>⬇️ 下一题</button>
        </div>
      }
      <div className="lyrics-container" ref={containerRef}>
        {[...lyricsData, { isSubmitPage: true }].map((item, i) => (
          <div className="lyrics-item" key={i}>
            {!item.isSubmitPage ? (
              // 正常题目页
              Object.entries(item.fillRandom)
                .filter(([key]) => !key.startsWith('_'))
                .map(([pos, text]) => {
                  // 有对应隐藏值说明是填空位置
                  const isFilled = text && lyricsData[currentIndex] && ('_' + pos in lyricsData[currentIndex].fillRandom);
                  return (
                    <div
                      key={pos}
                      className={`lyrics-part ${!text ? 'empty' : ''} ${isFilled ? 'filled' : ''}`}
                      onClick={() => text && handleFilledClick(pos)}
                    >
                      {text || '_____'}
                    </div>
                  );
                })
            ) : (
              // 最后一页：提交页
              <div className="submit-page">
                {isAllAnswered() ? (
                  <div className="submit-result">
                    <p>🎉 全部完成！</p>
                    <p>你的得分是：<strong>{calculateScore()}</strong> 分</p>
                    <button style={{
                      height: '50px',
                      width: '150px'
                    }} className="lyrics-button" onClick={handleSubmit}>查看详情</button>
                  </div>
                ) : (
                  <div className="submit-warning">
                    <p>⚠️ 你还有题目未完成，请完成后再提交。</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {
        currentIndex !== 20 &&
        <div className="lyrics-answer-container">
          {(lyricsAnswerArr[currentIndex]?.options || []).map((option, idx) => (
            <div className="answer-option" key={idx} onClick={() => handleOptionClick(option)}>
              {option}
            </div>
          ))}
        </div>
      }
    </div>
  );
};

export default Home;
