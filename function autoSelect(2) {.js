function autoSelect() {
    // 获取所有评分题目和是否选择题
    const ratingQuestions = document.querySelectorAll('li.dxt[data-yjzb="课程评价"]');
    const yesNoQuestions = document.querySelectorAll('li.dxt:not([data-yjzb="课程评价"])');
    
    if (ratingQuestions.length === 0 && yesNoQuestions.length === 0) {
        console.log('未找到任何题目');
        return;
    }

    // 处理评分题目
    ratingQuestions.forEach((question, index) => {
        const questionId = question.querySelector('.title').getAttribute('questionid');
        const fourStarButton = question.querySelector(`input[name="dxt_${questionId}"][value="16"]`);
        
        if (fourStarButton) {
            fourStarButton.checked = true;
            fourStarButton.dispatchEvent(new Event('change'));
            fourStarButton.dispatchEvent(new Event('click', { bubbles: true }));
            console.log(`评分题${questionId}: 已选择4星评分`);
        } else {
            console.log(`评分题${questionId}: 未找到4星评分按钮`);
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

    function autoSelect() {
    // 获取所有评分题目和是否选择题
    const ratingQuestions = document.querySelectorAll('li.dxt[data-yjzb="课程评价"]');
    const yesNoQuestions = document.querySelectorAll('li.dxt:not([data-yjzb="课程评价"])');
    
    if (ratingQuestions.length === 0 && yesNoQuestions.length === 0) {
        console.log('未找到任何题目');
        return;
    }

    // ...existing code...

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

// 启动自动评价流程
function startAutoEvaluation() {
    try {
        // 首先尝试点击课程评价按钮
        const evaluateBtn = document.querySelector('a.btn.blue.mini[onclick*="evaluate1"]');
        if (evaluateBtn) {
            evaluateBtn.click();
            console.log('开始课程评价流程');
            setTimeout(autoSelect, 1500);
        } else {
            console.log('没有找到待评价的课程');
        }
    } catch (error) {
        console.error('自动评价出错：', error);
    }
}

// 添加快捷键触发
document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 'a') {
        startAutoEvaluation();
    }
});
}