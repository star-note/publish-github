"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editInput = exports.checkParams = exports.DomType = void 0;
var DomType;
(function (DomType) {
    DomType["input"] = "INPUT";
    DomType["select"] = "SELECT";
    DomType["inputNumber"] = "INPUTNUMBER";
    DomType["textarea"] = "TEXTAREA";
    DomType["picker"] = "IMAGEPICKER";
    DomType["checkbox"] = "CHECKBOX";
})(DomType = exports.DomType || (exports.DomType = {}));
// 根据Confis检查参数
const checkParams = (params, configs) => {
    let matched = true;
    const isInclude = (arr1, arr2) => arr2.every(val => arr1.includes(val));
    if (!isInclude(configs.map(config => config.name), Object.keys(params))) {
        matched = false;
    }
    else {
        configs.forEach(config => {
            const value = params[config.name];
            // 当检测项包涵正则rules
            if (config.dom.rules) {
                config.dom.rules.forEach(rule => {
                    if (!rule.test(String(value)) ||
                        value === undefined ||
                        value === null) {
                        matched = false;
                    }
                });
            }
            // 当检测项是Select型
            // if（config.dom.type === 'SELECT') {
            // }
        });
    }
    return matched;
};
exports.checkParams = checkParams;
// 全选目标元素中内容进行更新
const editInput = async (selector, content, page, callback) => {
    try {
        await page.focus(selector);
        // await page.$eval(selector, () =>
        //   document.execCommand('selectall', false, undefined)
        // );
        await page.evaluate(() => document.execCommand('selectall', false, undefined));
        // await page.keyboard.sendCharacter('Backspace');
        await page.keyboard.sendCharacter(content);
    }
    catch (e) {
        callback(e);
    }
};
exports.editInput = editInput;
