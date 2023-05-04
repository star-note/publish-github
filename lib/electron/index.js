"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publish = exports.formConfigs = exports.startUrl = void 0;
const utils_1 = require("../utils");
const index_1 = require("../index");
exports.startUrl = 'https://www.github.com/login'; // 默认需要开始操作的URL
exports.formConfigs = [
    {
        dom: {
            type: utils_1.DomType.input,
            defaultValue: null,
            rules: [/\w+/],
            placeholder: '请输入Github用户名/邮箱',
            required: true,
        },
        label: 'Github用户名/邮箱',
        name: 'username',
        help: {
            description: '如何获取Github的账户？',
            url: 'https://docs.github.com/cn/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token',
        },
    },
    {
        dom: {
            type: utils_1.DomType.input,
            defaultValue: null,
            rules: [/\w+/],
            placeholder: '请输入密码',
            required: true,
        },
        label: 'Github账户密码',
        name: 'password',
        help: {
            description: '忘记Github的密码？',
            url: 'https://docs.github.com/cn/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token',
        },
    },
    {
        dom: {
            type: utils_1.DomType.input,
            defaultValue: 'CHENJI',
            rules: [/\w+/],
            placeholder: '请输入仓库名（英文）',
        },
        label: '仓库名',
        name: 'repo',
    },
];
// 进入仓库后编辑/新增笔记
const editRepo = async (user, payload, postProcess, page) => {
    const { path, repo, note } = payload;
    let publishPath; // 笔记发布路径
    if (path === '' || path === undefined || path === null) {
        publishPath = `笔记/${note.title}`;
    }
    else {
        publishPath = `笔记/${path}/${note.title}`;
    }
    await page.goto(`https://github.com/${user}/${repo}/edit/master/${publishPath}`);
    // 是否正常进入编辑页面
    const newContainer = await page.$('#repo-content-pjax-container');
    console.log('newContainer', newContainer);
    if (newContainer) {
        // 填入note内容，提交
        await (0, utils_1.editInput)('.CodeMirror-code', JSON.stringify(note), page, (e) => {
            postProcess(index_1.target.name, { type: 'error', message: String(e) });
        });
    }
    else {
        // 进入404页面则跳转到新增页面
        await page.goto(`https://github.com/${user}/${repo}/new/master/笔记/${path}`);
        await page.type('input[name="filename"]', note.title, { delay: 100 }); // 也可以用type输入，输入变慢，像一个用户
        await (0, utils_1.editInput)('.CodeMirror-code', JSON.stringify(note.content), page, (err) => {
            postProcess(index_1.target.name, { type: 'error', message: String(err) });
        });
    }
    try {
        await Promise.all([
            page.waitForNavigation(),
            page.click('button[type=submit]'),
        ]);
    }
    catch (e) {
        postProcess(index_1.target.name, {
            type: 'error',
            message: '发布失败，可能是发布内容无变更',
        });
    }
    postProcess(index_1.target.name, { type: 'success', message: '发布成功' });
};
const publish = async (payload, postProcess, page) => {
    (0, utils_1.checkParams)(payload, exports.formConfigs);
    postProcess(index_1.target.name, { process: 20, message: '开始登录' });
    const userInput = await page.$('#login_field');
    if (userInput) {
        try {
            await page.focus('#login_field');
            await page.keyboard.sendCharacter(payload.username);
            await page.focus('#password');
            await page.keyboard.sendCharacter(payload.password); // 更改密码
            // page.type('#mytextarea', 'World', {delay: 100}); // 也可以用type输入，输入变慢，像一个用户
            await Promise.all([
                page.waitForNavigation(),
                page.click('input[type=submit]'),
            ]);
            try {
                const errorTip = await page.$eval('#login #js-flash-container', el => el.innerText);
                console.log('errorTip: ', errorTip);
                if (errorTip && errorTip.indexOf('Incorrect') >= 0) {
                    postProcess(index_1.target.name, {
                        type: 'error',
                        message: '登录失败，用户名或密码错误',
                    });
                    console.log('登录失败');
                    return;
                }
            }
            catch (e) {
                console.log(e); // 页面没有找到errorTip，登录成功
            }
            console.log('登录成功');
        }
        catch (e) {
            console.log('登录失败', e);
            postProcess(index_1.target.name, {
                type: 'error',
                message: '登录目标页错误，可能是网络错误需要VPN',
            });
        }
    }
    // 点击新增，能新增仓库就新增，不能就直接跳到目标仓库
    const repoList = await page.waitForSelector('#repos-container');
    if (repoList) {
        // 进入模板页新建页
        await page.goto('https://github.com/star-note/CHENJI-Template/generate');
        const user = await page.$eval('#repository-owner', el => { var _a; return (_a = el.innerText) === null || _a === void 0 ? void 0 : _a.trim(); });
        await page.type('#new_repository_name', payload.repo, { delay: 100 }); // 也可以用type输入，输入变慢，像一个用户
        page.on('response', async (response) => {
            if (response.url() === 'https://github.com/repositories/check-name') {
                console.log(1111, response.url(), response.ok(), `https://github.com/${user}/${payload.repo}`);
                if (response.ok()) {
                    console.log('没有仓库需新建', response.status(), response.ok());
                    await Promise.all([
                        page.waitForNavigation(),
                        page.click('button[type=submit]'),
                    ]);
                }
                else {
                    await page.goto(`https://github.com/${user}/${payload.repo}`);
                }
                await editRepo(user, payload, postProcess, page);
            }
        });
    }
    else {
        postProcess(index_1.target.name, { type: 'error', message: '发布错误，联系官方' });
    }
};
exports.publish = publish;
