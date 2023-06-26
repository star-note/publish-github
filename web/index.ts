import { Octokit } from '@octokit/rest';
import { encode } from 'js-base64';
import { checkParams, Config, DomType, Message } from '../utils';

export const getForm = (note): Config[] => [
  {
    dom: {
      type: DomType.input,
      defaultValue: null,
      rule: {
        pattern: /\w+/,
        message: '请输入正确access-token',
      },
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
      type: DomType.input,
      defaultValue: null,
      // rule: /\w+/,
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
      type: DomType.input,
      defaultValue: 'CHENJI',
      rule: {
        pattern: /[a-zA-Z0-9]+/,
        message: '请输入正确英文/数字仓库名',
      },
      placeholder: '请输入仓库名（英文）',
    },
    label: '仓库名',
    name: 'repo',
  },
  {
    dom: {
      type: DomType.select,
      options: ['辰记发布'],
      defaultValue: '辰记发布',
    },
    label: '选择分类',
    name: 'category',
    help: {
      description: '文章的分类，存放目录，建议添加修改，默认为“辰记发布”',
    },
  },
  {
    dom: {
      type: DomType.input,
      defaultValue: note.title,
      // rule: {
      //   pattern: /\w+/,
      //   message: '请输入正确文件名',
      // },
      placeholder: '请输入文件名',
    },
    label: '发布文件名',
    name: 'name',
    help: {
      description: '保存的文件名，默认使用文章Title',
    },
  },
];

export interface Options {
  form: {
    accessToken: string;
    owner: string;
    repo: string;
    category: string;
    name: string;
  };
  note: Record<string, unknown>;
}
export const publish = async (
  options: Options,
  postProcess: (msg: Message) => void
) => {
  console.log('web publish start');
  const { form, note } = options || {};
  const { accessToken, owner, repo, category, name } = form;
  const formConfigs = getForm(note);
  // 校验参数
  if (!checkParams(form, formConfigs)) {
    console.log('参数校验失败');
    postProcess({
      time: new Date().getTime(),
      process: 100,
      content: '参数预校验失败，请检查配置参数或上报错误',
      status: 'fail',
    });
    return;
  }
  if (!note) {
    postProcess({
      time: new Date().getTime(),
      process: 100,
      content: '发布内容为空，请检查笔记内容或接入情况',
      status: 'fail',
    });
    return;
  }

  postProcess({
    time: new Date().getTime(),
    process: 10,
    content: '参数校验成功',
  });
  const github = new Octokit({
    auth: accessToken,
  });

  try {
    const repos = await github.request('GET /users/{owner}/repos', {
      owner,
    });
    console.log(repos);
    postProcess({
      time: new Date().getTime(),
      process: 20,
      content: '获取用户仓库成功',
    });

    // 仓库不存在就从模板新建仓库
    if (
      !(
        Array.isArray(repos.data) &&
        repos.data.filter(item => item.name === repo).length === 1
      )
    ) {
      console.log(
        '2222',
        repos.data,
        repos.data.filter(item => item.name === repo)
      );
      await github.rest.repos.createUsingTemplate({
        template_owner: 'star-note',
        template_repo: 'CHENJI-Template',
        name: repo,
        description: '辰记发布',
        homepage: 'https://abc.com',
      });
      postProcess({
        time: new Date().getTime(),
        process: 50,
        content: '新建仓库成功',
      });
    }

    let publishPath: string; // 笔记发布路径
    if (category === '' || category === undefined || category === null) {
      publishPath = `笔记/${name}`;
    } else {
      publishPath = `笔记/${category}/${name}`;
    }
    console.log(publishPath);

    // 仓库存在，先判断是否原文件存在，不存在新建，存在需拿到原文件的sha值再进行更新
    const result = await github.rest.repos
      .getContent({
        owner,
        repo,
        path: publishPath,
      })
      .then(resp =>
        !Array.isArray(resp) && !Array.isArray(resp.data)
          ? resp.data.sha
          : undefined
      )
      .catch(e => {
        console.log('获取文件错误：', e);
      })
      .then(sha => {
        console.log(sha);
        postProcess({
          time: new Date().getTime(),
          process: 70,
          content: '开始写入仓库',
        });
        return github.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: publishPath, // 笔记发布路径
          message: '辰记发布-id-1', // 本次发布message
          content: encode(JSON.stringify(note)), // 内容必须base64
          ...(sha ? { sha } : null),
        });
      })
      .catch(e => {
        console.log('新增/更新文件错误：', e);
        // e.code === 404
        postProcess({
          time: new Date().getTime(),
          status: 'fail',
          process: 100,
          content: 'access_token权限不足，请参照示例重新生成有权限access_token',
          link: '',
          type: 'url',
        });
      });

    console.log(result);
    postProcess({
      time: new Date().getTime(),
      status: 'success',
      content: '发布成功，点击查看发布地址',
      process: 100,
      link: 'https://www.baidu.com',
      type: 'url',
    });
  } catch (e) {
    console.log('发布错误：', e);
    if (e.code === 500) {
      postProcess({
        time: new Date().getTime(),
        status: 'fail',
        content: '网络错误，请检查网络或需要VPN',
      });
    } else {
      // 区分code，401为auth错误
      postProcess({
        time: new Date().getTime(),
        status: 'fail',
        content: '用户名或access-token错误或已过期',
      });
    }
  }
};
