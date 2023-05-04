"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publish = exports.formConfigs = void 0;
const rest_1 = require("@octokit/rest");
const js_base64_1 = require("js-base64");
const utils_1 = require("../utils");
exports.formConfigs = [
    {
        dom: {
            type: utils_1.DomType.input,
            defaultValue: null,
            rules: [/\w+/],
            placeholder: '请输入Github access-token',
            required: true,
        },
        label: 'access-token',
        name: 'accessToken',
        help: {
            description: '如何获取Github的个人access-token？',
            url: 'https://docs.github.com/cn/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token',
        },
    },
    {
        dom: {
            type: utils_1.DomType.input,
            defaultValue: null,
            rules: [/\w+/],
            placeholder: '请输入Github用户名',
            required: true,
        },
        label: 'Github用户名/owner',
        name: 'owner',
        help: {
            description: '没有用户？创建一个',
            url: 'https://www.github.com/',
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
    {
        dom: {
            type: utils_1.DomType.checkbox,
            defaultValue: true,
        },
        label: '保留目录结构',
        name: 'keepPath',
        help: {
            description: '即是否将当前笔记的层级按文件夹形式保存在Github中',
        },
    },
];
const publish = async (options, postProcess) => {
    console.log('web publish start');
    const { form, note, path } = options || {};
    const { accessToken, owner, repo } = form;
    // 校验参数
    if (!(0, utils_1.checkParams)(form, exports.formConfigs)) {
        console.log('参数校验失败');
        postProcess({
            type: 'error',
            message: '参数预校验失败',
            help: {
                description: '请检查配置参数或上报错误',
                url: 'https://www.baidu.com',
            },
        });
        return;
    }
    if (!note) {
        postProcess({
            type: 'error',
            message: '发布内容为空',
            help: {
                description: '请检查笔记内容或接入情况',
                url: 'https://www.baidu.com',
            },
        });
        return;
    }
    postProcess({
        process: 10,
        message: '参数校验成功',
    });
    const github = new rest_1.Octokit({
        auth: accessToken,
    });
    try {
        const repos = await github.request('GET /users/{owner}/repos', {
            owner,
        });
        console.log(repos);
        postProcess({
            process: 20,
            message: '获取用户仓库成功',
        });
        // 仓库不存在就从模板新建仓库
        if (!(Array.isArray(repos.data) &&
            repos.data.filter(item => item.name === repo).length === 1)) {
            console.log('2222', repos.data, repos.data.filter(item => item.name === repo));
            await github.rest.repos.createUsingTemplate({
                template_owner: 'star-note',
                template_repo: 'CHENJI-Template',
                name: repo,
                description: '辰记发布',
                homepage: 'https://abc.com',
            });
            postProcess({
                process: 50,
                message: '新建仓库成功',
            });
        }
        let publishPath; // 笔记发布路径
        if (path === '' || path === undefined || path === null) {
            publishPath = `笔记/${note.title}`;
        }
        else {
            publishPath = `笔记/${path}/${note.title}`;
        }
        console.log(publishPath);
        // 仓库存在，先判断是否原文件存在，不存在新建，存在需拿到原文件的sha值再进行更新
        const result = await github.rest.repos
            .getContent({
            owner,
            repo,
            path: publishPath,
        })
            .then(resp => !Array.isArray(resp) && !Array.isArray(resp.data)
            ? resp.data.sha
            : undefined)
            .catch(e => {
            console.log('获取文件错误：', e);
        })
            .then(sha => {
            console.log(sha);
            postProcess({
                process: 70,
                message: '开始写入仓库',
            });
            return github.rest.repos.createOrUpdateFileContents({
                owner,
                repo,
                path: publishPath,
                message: '辰记发布-id-1',
                content: (0, js_base64_1.encode)(JSON.stringify(note)),
                ...(sha ? { sha } : null),
            });
        })
            .catch(e => {
            console.log('新增/更新文件错误：', e);
            // e.code === 404
            postProcess({
                type: 'error',
                message: 'access_token权限不足',
                help: {
                    description: '请参照示例重新生成有权限access_token',
                    url: 'https://www.baidu.com',
                },
            });
        });
        console.log(result);
        postProcess({
            type: 'success',
            message: '发布成功',
            help: {
                description: '-----',
                url: 'https://www.baidu.com',
            },
        });
    }
    catch (e) {
        console.log('发布错误：', e);
        if (e.code === 500) {
            postProcess({
                type: 'error',
                message: '网络错误',
                help: {
                    description: '请检查网络或需要VPN',
                    url: 'https://www.baidu.com',
                },
            });
        }
        else {
            // 区分code，401为auth错误
            postProcess({
                type: 'error',
                message: '用户名或access-token错误或已过期',
                help: {
                    description: '请检查Github设置',
                    url: 'https://www.baidu.com',
                },
            });
        }
    }
};
exports.publish = publish;
