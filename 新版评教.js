let isAutoEvaluating = false;
let currentEvaluationTimeout = null;

// 主评价函数
function autoSelect() {
    if (document.readyState !== 'complete') {
        console.log('等待页面加载...');
        setTimeout(autoSelect, 1000);
        return;
    }

    // 获取所有评分题目和是否选择题
    const ratingControls = document.querySelectorAll('li.dxt:has(input[type="radio"][value="16"])');
    if (!ratingControls || ratingControls.length === 0) {
        console.log('未找到评分选项，重试中...');
        setTimeout(autoSelect, 1500);
        return;
    }
    const yesNoQuestions = document.querySelectorAll('li.dxt:not([data-yjzb="课程评价"])');
    
    try {
        let hasFourStar = false;
        // 处理是否题
        yesNoQuestions.forEach((question) => {
            const questionId = question.querySelector('.title').getAttribute('questionid');
            const options = question.querySelectorAll('input[type="radio"]');
            if (options.length > 0) {
                options[0].checked = true;
                options[0].dispatchEvent(new Event('change'));
                options[0].dispatchEvent(new Event('click', { bubbles: true }));
                console.log(`是否题${questionId}: 已选择"是"`);
            }
        });
        // 第一次遍历：设置一个四星评分
        for (let i = 0; i < ratingControls.length && !hasFourStar; i++) {
            const control = ratingControls[i];
            const fourStarInput = control.querySelector('input[value="16"]');
            
            if (fourStarInput && !hasFourStar) {
                // 清除当前题目的其他选择
                control.querySelectorAll('input[type="radio"]').forEach(input => {
                    input.checked = false;
                    const span = input.closest('span');
                    if (span) span.classList.remove('checked');
                });

                // 设置四星评分
                fourStarInput.checked = true;
                const span = fourStarInput.closest('span');
                if (span) span.classList.add('checked');
                fourStarInput.dispatchEvent(new Event('change'));
                fourStarInput.dispatchEvent(new Event('click', { bubbles: true }));
                
                hasFourStar = true;
                console.log(`已在第${i + 1}题设置四星评分`);
                
                // 立即跳出循环
                break;
            }
        }

        // 第二次遍历：设置其他题目为五星
        ratingControls.forEach((control, index) => {
            // 跳过已设置四星的题目
            if (control.querySelector('input[value="16"]:checked')) {
                return;
            }

            const fiveStarInput = control.querySelector('input[value="20"]');
            if (fiveStarInput) {
                // 清除当前题目的其他选择
                control.querySelectorAll('input[type="radio"]').forEach(input => {
                    input.checked = false;
                    const span = input.closest('span');
                    if (span) span.classList.remove('checked');
                });

                // 设置五星评分
                fiveStarInput.checked = true;
                const span = fiveStarInput.closest('span');
                if (span) span.classList.add('checked');
                fiveStarInput.dispatchEvent(new Event('change'));
                fiveStarInput.dispatchEvent(new Event('click', { bubbles: true }));
                
                console.log(`已在第${index + 1}题设置五星评分`);
            }
        });

        // 验证是否已设置一个四星评分
        const verifyFourStar = document.querySelector('input[value="16"]:checked');
        if (!verifyFourStar) {
            console.log('警告：未成功设置四星评分，重试中...');
            setTimeout(autoSelect, 1000);
            return;
        }

        console.log('所有评分设置完成');

        

        // 提交评价
        setTimeout(() => {
            const submitBtn = document.querySelector('#pjsubmit');
            if (submitBtn) {
                submitBtn.click();
                console.log('已点击提交按钮');

                // 等待提交后关闭窗口
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

        return true;

    } catch (error) {
        console.error('评分过程出错:', error);
        setTimeout(autoSelect, 1500);
        return false;
    }
}

// 处理下一个评价
function processNextEvaluation() {
    setTimeout(() => {
        // 查找所有未评价的按钮
        const evaluateButtons = document.querySelectorAll('a.btn.blue.mini[onclick*="evaluate1"]');
        if (evaluateButtons.length > 0) {
            // 随机选择一个未评价的课程
            const randomIndex = Math.floor(Math.random() * evaluateButtons.length);
            evaluateButtons[randomIndex].click();
            console.log('开始评价新课程');
            setTimeout(autoSelect, 1500);
        } else {
            console.log('所有课程已评价完成');
            isAutoEvaluating = false;
        }
    }, 1500);
}

// 启动评价流程
function startAutoEvaluation() {
    if (isAutoEvaluating) {
        console.log('评价进程已在运行中');
        return;
    }

    isAutoEvaluating = true;
    const evaluateButtons = document.querySelectorAll('a.btn.blue.mini[onclick*="evaluate1"]');
    
    if (evaluateButtons.length > 0) {
        const randomIndex = Math.floor(Math.random() * evaluateButtons.length);
        evaluateButtons[randomIndex].click();
        console.log('开始自动评价流程');
        setTimeout(autoSelect, 1500);
    } else {
        console.log('未找到可评价的课程');
        isAutoEvaluating = false;
    }
}
// 自动循环评价所有未评价教师
function autoEvaluateAllTeachers() {
    // 获取所有未评价教师
    const unEvaluated = Array.from(document.querySelectorAll('.test-box-item[data-status="0"]'));
    if (unEvaluated.length === 0) {
        // 没有未评价教师，返回课程列表
        const closeBtn = document.querySelector('button.btn.test-box-close[data-dismiss="modal"]');
        if (closeBtn) closeBtn.click();
        setTimeout(() => {
            // 返回课程列表后可自动点击下一个“评价”按钮
            const nextCourseBtn = document.querySelector('a.btn.blue.mini:contains("评价")');
            if (nextCourseBtn) nextCourseBtn.click();
        }, 1000);
        return;
    }

    // 依次评价每个未评价教师
    function evaluateNextTeacher(index) {
        if (index >= unEvaluated.length) {
            // 评价完所有教师，关闭弹窗
            const closeBtn = document.querySelector('button.btn.test-box-close[data-dismiss="modal"]');
            if (closeBtn) closeBtn.click();
            setTimeout(() => {
                // 返回课程列表后可自动点击下一个“评价”按钮
                const nextCourseBtn = document.querySelector('a.btn.blue.mini:contains("评价")');
                if (nextCourseBtn) nextCourseBtn.click();
            }, 1000);
            return;
        }
        // 点击教师
        unEvaluated[index].click();
        setTimeout(() => {
            autoEvaluateCurrentTeacher();
            setTimeout(() => {
                evaluateNextTeacher(index + 1);
            }, 2500); // 等待评价和关闭
        }, 1000); // 等待页面切换
    }

    evaluateNextTeacher(0);
}

// 启动自动评价
autoEvaluateAllTeachers();

// 停止评价
function stopAutoEvaluation() {
    isAutoEvaluating = false;
    if (currentEvaluationTimeout) {
        clearTimeout(currentEvaluationTimeout);
    }
    console.log('已停止自动评价');
}

// 添加快捷键和点击事件
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
    // 排除评价相关按钮的点击
    if (!e.target.matches('#pjsubmit, .btn.blue.submitLoading, .btn.test-box-close, a.btn.blue.mini')) {
        if (isAutoEvaluating) {
            stopAutoEvaluation();
        }
    }
});

console.log('自动评价程序已加载，按Alt+A开始评价');