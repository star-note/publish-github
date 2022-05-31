import { Octokit } from '@octokit/rest';

enum DomType {
  input = 'INPUT',
  select = 'SELECT',
  inputNumber = 'INPUTNUMBER',
  textarea = 'TEXTAREA',
  picker = 'IMAGEPICKER',
  checkbox = 'CHECKBOX',
}
export interface Config {
  dom: {
    type: DomType.input | DomType.checkbox;
    defaultValue?: string | boolean | null;
    rules?: RegExp[];
    placehoudler?: string;
    required?: boolean;
  };
  name: string;
  label: string;
  help?: {
    decription: string;
    url?: string;
  };
}

export const configs: Config[] = [
  {
    dom: {
      type: DomType.input,
      defaultValue: null,
      rules: [/\w+/],
      placehoudler: '请输入Github access-token',
      required: true,
    },
    label: 'access-token',
    name: 'accessToken',
    help: {
      decription: '如何获取Github的个人access-token？',
      url: 'https://docs.github.com/cn/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token',
    },
  },
  {
    dom: {
      type: DomType.input,
      defaultValue: null,
      rules: [/\w+/],
      placehoudler: '请输入Github用户名',
      required: true,
    },
    label: 'Github用户名/owner',
    name: 'owner',
    help: {
      decription: '没有用户？创建一个',
      url: 'https://www.github.com/',
    },
  },
  {
    dom: {
      type: DomType.input,
      defaultValue: 'CHENJI',
      rules: [/\w+/],
      placehoudler: '请输入仓库名（英文）',
    },
    label: '仓库名',
    name: 'repo',
  },
  {
    dom: {
      type: DomType.checkbox,
      defaultValue: true,
    },
    label: '保留目录结构',
    name: 'keepPath',
    help: {
      decription: '即是否将当前笔记的层级按文件夹形式保存在Github中',
    },
  },
];

export interface Options {
  form: {
    accessToken: string;
    owner: string;
    repo: string;
    keepPath: boolean;
  };
  note: Record<string, unknown>;
  path?: string;
}
export const publish = async (
  options: Options,
  processCB: (process: number, message: string) => void,
  finishCB: (type: string, message: string, help?: any) => void
) => {
  console.log('web publish start');
  const { form, note, path } = options || {};
  // 校验参数
  if (!checkParams(form, configs)) {
    console.log('参数校验失败');
    finishCB('error', '参数预校验失败', {
      decription: '请检查配置参数或上报错误',
      url: 'https://www.baidu.com'
    });
    return null;
  }

  processCB('参数校验成功');
  const github = new Octokit({
    auth: form.accessToken,
  });

  github
    .request('GET /users/{owner}/repos', {
      owner: form.owner,
    })
    .then((data) => console.log(data));
};

export const checkParams = (params: Options['form'], configs: Config[]) => {
  let matched = true;
  const isInclude = (arr1: string[], arr2: string[]) =>
    arr2.every((val) => arr1.includes(val));
  if (
    !isInclude(
      configs.map((config) => config.name),
      Object.keys(params)
    )
  ) {
    matched = false;
  } else {
    configs.forEach((config) => {
      const value = params[config.name as keyof typeof params];
      // 当检测项包涵正则rules
      if (config.dom.rules) {
        config.dom.rules.forEach((rule) => {
          if (
            !rule.test(String(value)) ||
            value === undefined ||
            value === null
          ) {
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

export const postProgress = (message) => {};
