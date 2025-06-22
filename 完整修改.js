let isAutoEvaluating = false;
let currentEvaluationTimeout = null;

function autoSelect() {
    if (document.readyState !== 'complete') {
        console.log('等待页面加载...');
        setTimeout(autoSelect, 1000);
        return;
    }

    try {
        // 获取评分题和是否题
        const ratingQuestions = document.querySelectorAll('li.dxt[data-yjzb="课程评价"]');
        const yesNoQuestions = document.querySelectorAll('li.dxt:not([data-yjzb="课程评价"])');

        if ((!ratingQuestions || ratingQuestions.length === 0) && (!yesNoQuestions || yesNoQuestions.length === 0)) {
            console.log('未找到任何题目，重试中...');
            setTimeout(autoSelect, 1500);
            return;
        }

        // 处理评分题
        let hasFourStar = false;
        ratingQuestions.forEach((question, index) => {
            // 确保第一题为4星评分
            if (index === 0) {
                const fourStarInput = question.querySelector('input[value="16"]');
                if (fourStarInput) {
                    fourStarInput.checked = true;
                    const span = fourStarInput.closest('span');
                    if (span) {
                        question.querySelectorAll('span.checked').forEach(s => s.classList.remove('checked'));
                        span.classList.add('checked');
                    }
                    fourStarInput.dispatchEvent(new Event('change'));
                    fourStarInput.dispatchEvent(new Event('click', { bubbles: true }));
                    hasFourStar = true;
                    console.log('第一题已设置为4星评分');
                }
            } else {
                // 其他题目设置为5星评分
                const fiveStarInput = question.querySelector('input[value="20"]');
                if (fiveStarInput) {
                    fiveStarInput.checked = true;
                    const span = fiveStarInput.closest('span');
                    if (span) {
                        question.querySelectorAll('span.checked').forEach(s => s.classList.remove('checked'));
                        span.classList.add('checked');
                    }
                    fiveStarInput.dispatchEvent(new Event('change'));
                    fiveStarInput.dispatchEvent(new Event('click', { bubbles: true }));
                }
            }
        });

        // 处理是否题
        yesNoQuestions.forEach(question => {
            const firstOption = question.querySelector('input[type="radio"]');
            if (firstOption) {
                firstOption.checked = true;
                const span = firstOption.closest('span');
                if (span) {
                    question.querySelectorAll('span.checked').forEach(s => s.classList.remove('checked'));
                    span.classList.add('checked');
                }
                firstOption.dispatchEvent(new Event('change'));
                firstOption.dispatchEvent(new Event('click', { bubbles: true }));
            }
        });

        // 验证所有题目已答
        const allAnswered = Array.from(document.querySelectorAll('li.dxt')).every(q => 
            q.querySelector('input[type="radio"]:checked')
        );

        if (!allAnswered || !hasFourStar) {
            console.log('部分题目未完成或未设置4星评分，重试中...');
            setTimeout(autoSelect, 1500);
            return;
        }

        // 提交评价
        setTimeout(() => {
            const submitBtn = document.querySelector('#pjsubmit');
            if (submitBtn) {
                submitBtn.click();
                console.log('已点击提交按钮');

                // 处理关闭按钮
                setTimeout(() => {
                    const closeBtn = document.querySelector('button.btn.blue.submitLoading[data-dismiss="modal"]');
                    if (closeBtn) {
                        closeBtn.click();
                        console.log('已点击关闭按钮');
                        processNextEvaluation();
                    }
                }, 1000);
            }
        }, 1000);

    } catch (error) {
        console.error('评分过程出错:', error);
        setTimeout(autoSelect, 1500);
    }
}


function processNextEvaluation() {
    setTimeout(() => {
        if (!isAutoEvaluating) return;

        const evaluateButtons = document.querySelectorAll('a.btn.blue.mini[onclick*="evaluate1"]');
        if (evaluateButtons.length > 0) {
            const randomBtn = evaluateButtons[Math.floor(Math.random() * evaluateButtons.length)];
            randomBtn.click();
            console.log('开始评价新课程');
            setTimeout(autoSelect, 1500);
        } else {
            console.log('所有课程已评价完成');
            isAutoEvaluating = false;
        }
    }, 1500);
}

function startAutoEvaluation() {
    if (isAutoEvaluating) {
        console.log('评价进程已在运行中');
        return;
    }

    isAutoEvaluating = true;
    const evaluateButtons = document.querySelectorAll('a.btn.blue.mini[onclick*="evaluate1"]');
    
    if (evaluateButtons.length > 0) {
        const randomBtn = evaluateButtons[Math.floor(Math.random() * evaluateButtons.length)];
        randomBtn.click();
        console.log('开始自动评价流程');
        setTimeout(autoSelect, 1500);
    } else {
        console.log('未找到可评价的课程');
        isAutoEvaluating = false;
    }
}

function stopAutoEvaluation() {
    isAutoEvaluating = false;
    if (currentEvaluationTimeout) {
        clearTimeout(currentEvaluationTimeout);
    }
    console.log('已停止自动评价');
}

// 添加快捷键和点击事件监听
document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 'a') {
        if (!isAutoEvaluating) {
            startAutoEvaluation();
        } else {
            stopAutoEvaluation();
        }
    }
});

// 添加点击停止功能
document.addEventListener('click', (e) => {
    if (!e.target.matches('#pjsubmit, .btn.blue.submitLoading, .btn.test-box-close, a.btn.blue.mini')) {
        if (isAutoEvaluating) {
            stopAutoEvaluation();
        }
    }
});

console.log('自动评价程序已加载，按Alt+A开始评价');