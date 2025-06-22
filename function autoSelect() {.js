let isAutoEvaluating = false;
let currentEvaluationTimeout = null;

function autoSelect() {
    // 获取所有评分题目和是否选择题
    const ratingQuestions = document.querySelectorAll('li.dxt[data-yjzb="课程评价"]');
    const yesNoQuestions = document.querySelectorAll('li.dxt:not([data-yjzb="课程评价"])');
     
    if (ratingQuestions.length === 0 && yesNoQuestions.length === 0) {
        console.log('未找到任何题目');
        return;
    }

    
    // 处理评分题目
    let fourStarCount = 0;
    const requiredFourStarCount = Math.ceil(ratingQuestions.length * 0.3);
    
    ratingQuestions.forEach((question, index) => {
        const questionId = question.querySelector('.title').getAttribute('questionid');
        
        // 确定是否选择4星
        const shouldSelectFourStar = fourStarCount < requiredFourStarCount && 
                                   index < Math.ceil(ratingQuestions.length * 0.7);
        
        const value = shouldSelectFourStar ? "16" : "20";
        
        // 查找星级评分按钮
        let starButton = null;
        let starSpan = null;

        // 尝试多种选择器组合查找按钮
        const possibleSelectors = [
            `input[name="dxt_${questionId}"][sfjft="1"][value="${value}"]`,
            `input[name="dxt_${questionId}"][value="${value}"]`,
            `input[type="radio"][name="dxt_${questionId}"][value="${value}"]`
        ];

        // 遍历所有可能的选择器直到找到按钮
        for (const selector of possibleSelectors) {
            starButton = question.querySelector(selector);
            if (starButton) {
                starSpan = starButton.closest('span');
                if (starSpan) break;
            }
        }
        
        if (starButton) {
            // 设置选中状态
            starButton.checked = true;
            if (starSpan) {
                starSpan.classList.add('checked');
            }
            // 触发必要的事件
            starButton.dispatchEvent(new Event('change'));
            starButton.dispatchEvent(new Event('click', { bubbles: true }));
            
            if (value === "16") {
                fourStarCount++;
                console.log(`评分题${questionId}: 已选择4星评分 (当前4星数量: ${fourStarCount})`);
            } else {
                console.log(`评分题${questionId}: 已选择5星评分`);
            }
        } else {
            console.log(`评分题${questionId}: 未找到${value === "16" ? "4星" : "5星"}评分按钮，尝试的选择器：`, possibleSelectors);
        }
    });
    
    // 处理是否选择题
    yesNoQuestions.forEach((question, index) => {
        const questionId = question.querySelector('.title').getAttribute('questionid');
        // 查找所有选项
        const options = question.querySelectorAll(`input[name="dxt_${questionId}"]`);
        
        if (options.length > 0) {
            // 默认选择"是"选项（通常是第一个选项）
            const yesOption = options[0];
            yesOption.checked = true;
            yesOption.dispatchEvent(new Event('change'));
            yesOption.dispatchEvent(new Event('click', { bubbles: true }));
            console.log(`是否题${questionId}: 已选择"是"`);
        } else {
            console.log(`是否题${questionId}: 未找到选项`);
        }
    });
      // 修改延迟提交按钮点击的逻辑
    setTimeout(() => {
        const submitBtn = document.querySelector('#pjsubmit');
        if (submitBtn) {
            submitBtn.click();
            console.log('已点击提交按钮');
            
            // 添加处理弹窗的逻辑
            setTimeout(() => {
                // 使用新的选择器查找关闭按钮
                const closeBtn = document.querySelector('button.btn.blue.submitLoading[data-dismiss="modal"]');
                if (closeBtn) {
                    closeBtn.click();
                    console.log('已点击关闭按钮');
                    
                    // 等待弹窗关闭后处理下一个评价
                    setTimeout(() => {
                        // 查找未评价的项目（排除当前项目）
                        const currentItem = document.querySelector('.test-box-item.active');
                        const allUnfinishedItems = document.querySelectorAll('.test-box-item[data-status="0"]');
                        
                        // 转换为数组并过滤掉当前项目
                        const nextItems = Array.from(allUnfinishedItems).filter(item => 
                            !currentItem || item.getAttribute('data-item') !== currentItem.getAttribute('data-item')
                        );
                        
                        if (nextItems.length > 0) {
                            nextItems[0].click();
                            console.log('已切换到下一个评价项目');
                            setTimeout(autoSelect, 1500);
                        } else {
                            console.log('当前课程的评价项目已完成，准备关闭并进入下一个课程');
                            // 查找并点击最终的关闭按钮
                            setTimeout(() => {
                                const finalCloseBtn = document.querySelector('button.btn.test-box-close[data-dismiss="modal"]');
                                if (finalCloseBtn) {
                                    finalCloseBtn.click();
                                    console.log('已关闭评价窗口');
                                    
                                    // 等待页面加载完成后查找下一个待评价课程
                                    setTimeout(() => {
                                        const nextCourseBtn = document.querySelector('a.btn.blue.mini[onclick*="evaluate1"]');
                                        if (nextCourseBtn) {
                                            console.log('找到下一个待评价课程，准备开始评价');
                                            nextCourseBtn.click();
                                            setTimeout(autoSelect, 1500);
                                        } else {
                                            console.log('所有课程评价已完成！');
                                        }
                                    }, 1500);
                                } else {
                                    console.error('未找到最终关闭按钮');
                                }
                            }, 1000);
                        }
                    }, 1000);
                } else {
                    console.error('未找到关闭按钮');
                }
            }, 800);
        } else {
            console.error('未找到提交按钮');
        }
    }, 1000);
}

function processNextPage() {
    // 等待页面加载完成后执行下一步
    setTimeout(() => {
        const closeBtn = document.querySelector('button.btn.test-box-close[data-dismiss="modal"]');
        if (closeBtn) {
            closeBtn.click();
            console.log('已关闭当前评价页面');
            
            // 等待返回主页面后查找下一个待评价课程
            setTimeout(() => {
                const evaluateButtons = document.querySelectorAll('a.btn.blue.mini[onclick*="evaluate1"]');
                if (evaluateButtons.length > 0) {
                    // 随机选择一个未评价的课程
                    const randomIndex = Math.floor(Math.random() * evaluateButtons.length);
                    evaluateButtons[randomIndex].click();
                    console.log('已选择新的课程进行评价');
                    
                    // 等待新页面加载完成后开始评价
                    setTimeout(() => {
                        const firstItem = document.querySelector('.test-box-item[data-status="0"]');
                        if (firstItem) {
                            firstItem.click();
                            setTimeout(autoSelect, 1500);
                        }
                    }, 1500);
                } else {
                    console.log('所有课程已评价完成');
                    isAutoEvaluating = false;
                }
            }, 1000);
        }
    }, 1000);
}

function startAutoEvaluation() {
    try {
        if (isAutoEvaluating) {
            console.log('评价进程已在运行中');
            return;
        }
        
        isAutoEvaluating = true;
        const evaluateButtons = document.querySelectorAll('a.btn.blue.mini[onclick*="evaluate1"]');
        
        if (evaluateButtons.length > 0) {
            // 随机选择一个课程开始评价
            const randomIndex = Math.floor(Math.random() * evaluateButtons.length);
            evaluateButtons[randomIndex].click();
            console.log('开始评价流程');
            
            setTimeout(() => {
                const firstItem = document.querySelector('.test-box-item[data-status="0"]');
                if (firstItem) {
                    firstItem.click();
                    setTimeout(autoSelect, 1500);
                }
            }, 1500);
        } else {
            console.log('未找到可评价的课程');
            isAutoEvaluating = false;
        }
    } catch (error) {
        console.error('启动评价过程时出错：', error);
        isAutoEvaluating = false;
    }
}
// 确保在页面加载完成后才添加事件监听器
document.addEventListener('DOMContentLoaded', () => {
    // 添加点击事件监听器
    document.addEventListener('click', (e) => {
        // 排除特定按钮的点击
        if (e.target.matches('#pjsubmit, .btn.blue.submitLoading, .btn.test-box-close')) {
            return;
        }
        if (isAutoEvaluating) {
            stopAutoEvaluation();
        }
    });

    // 添加快捷键触发
    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key === 'a') {
            if (!isAutoEvaluating) {
                startAutoEvaluation();
            } else {
                stopAutoEvaluation();
            }
        }
    });
});

// 初始化时确保变量状态正确
console.log('自动评价程序已加载，按Alt+A开始评价');