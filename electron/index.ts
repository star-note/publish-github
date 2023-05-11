import { checkParams, Config, DomType, editInput, Message } from '../utils';
// import { target } from '../index';

export const startUrl = 'https://www.github.com/login'; // 默认需要开始操作的URL
export const getForm = (note): Config[] => [
  {
    dom: {
      type: DomType.input,
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
      type: DomType.input,
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
      type: DomType.input,
      defaultValue: 'CHENJI',
      rules: [/\w+/],
      placeholder: '请输入仓库名（英文）',
    },
    label: '仓库名',
    name: 'repo',
  },
  {
    dom: {
      type: DomType.select,
    },
    label: '选择分类',
    name: 'category',
    help: {
      description: '文章的分类，存放目录',
    },
  },
  {
    dom: {
      type: DomType.input,
      defaultValue: note.title,
      rules: [/\w+/],
      placeholder: '请输入文件名',
    },
    label: '发布文件名',
    name: 'name',
    help: {
      description: '保存的文件名，默认使用文章Title',
    },
  },
];

// 进入仓库后编辑/新增笔记
const editRepo = async (
  user: string,
  payload: Record<string, any>,
  postProcess: (target: string, msg: Message) => void,
  page: any
) => {
  const { path, repo, note } = payload;
  let publishPath: string; // 笔记发布路径
  if (path === '' || path === undefined || path === null) {
    publishPath = `笔记/${note.title}`;
  } else {
    publishPath = `笔记/${path}/${note.title}`;
  }
  await page.goto(
    `https://github.com/${user}/${repo}/edit/master/${publishPath}`
  );
  // 是否正常进入编辑页面
  const newContainer = await page.$('#repo-content-pjax-container');
  console.log('newContainer', newContainer);
  if (newContainer) {
    // 填入note内容，提交
    await editInput(
      '.CodeMirror-code',
      JSON.stringify(note),
      page,
      (e: unknown) => {
        postProcess('github', { type: 'error', message: String(e) });
      }
    );
  } else {
    // 进入404页面则跳转到新增页面
    await page.goto(
      `https://github.com/${user}/${repo}/new/master/笔记/${path}`
    );
    await page.type('input[name="filename"]', note.title, { delay: 100 }); // 也可以用type输入，输入变慢，像一个用户
    await editInput(
      '.CodeMirror-code',
      JSON.stringify(note.content),
      page,
      (err: unknown) => {
        postProcess('github', { type: 'error', message: String(err) });
      }
    );
  }
  try {
    await Promise.all([
      page.waitForNavigation(), // The promise resolves after navigation has finished
      page.click('button[type=submit]'),
    ]);
  } catch (e) {
    postProcess('github', {
      type: 'error',
      message: '发布失败，可能是发布内容无变更',
    });
  }

  postProcess('github', { type: 'success', message: '发布成功' });
};

export const publish = async (
  payload: Record<string, any>,
  postProcess: (target: string, msg: Message) => void,
  page: any
) => {
  checkParams(payload, formConfigs);
  postProcess('github', { process: 20, message: '开始登录' });
  const userInput = await page.$('#login_field');
  if (userInput) {
    try {
      await page.focus('#login_field');
      await page.keyboard.sendCharacter(payload.username);
      await page.focus('#password');
      await page.keyboard.sendCharacter(payload.password); // 更改密码
      // page.type('#mytextarea', 'World', {delay: 100}); // 也可以用type输入，输入变慢，像一个用户
      await Promise.all([
        page.waitForNavigation(), // The promise resolves after navigation has finished
        page.click('input[type=submit]'),
      ]);
      try {
        const errorTip = await page.$eval(
          '#login #js-flash-container',
          el => el.innerText
        );
        console.log('errorTip: ', errorTip);
        if (errorTip && errorTip.indexOf('Incorrect') >= 0) {
          postProcess('github', {
            type: 'error',
            message: '登录失败，用户名或密码错误',
          });
          console.log('登录失败');
          return;
        }
      } catch (e) {
        console.log(e); // 页面没有找到errorTip，登录成功
      }

      console.log('登录成功');
    } catch (e) {
      console.log('登录失败', e);
      postProcess('github', {
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

    const user = await page.$eval('#repository-owner', el =>
      el.innerText?.trim()
    );
    await page.type('#new_repository_name', payload.repo, { delay: 100 }); // 也可以用type输入，输入变慢，像一个用户
    page.on('response', async response => {
      if (response.url() === 'https://github.com/repositories/check-name') {
        console.log(
          1111,
          response.url(),
          response.ok(),
          `https://github.com/${user}/${payload.repo}`
        );
        if (response.ok()) {
          console.log('没有仓库需新建', response.status(), response.ok());
          await Promise.all([
            page.waitForNavigation(), // The promise resolves after navigation has finished
            page.click('button[type=submit]'),
          ]);
        } else {
          await page.goto(`https://github.com/${user}/${payload.repo}`);
        }
        await editRepo(user, payload, postProcess, page);
      }
    });
  } else {
    postProcess('github', { type: 'error', message: '发布错误，联系官方' });
  }
};
