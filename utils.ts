export enum DomType {
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
    placeholder?: string;
    required?: boolean;
  };
  name: string;
  label: string;
  help?: {
    description: string;
    url?: string;
  };
}

// 根据Confis检查参数
export const checkParams = (
  params: Record<string, unknown>,
  configs: Config[]
) => {
  let matched = true;
  const isInclude = (arr1: string[], arr2: string[]) =>
    arr2.every(val => arr1.includes(val));
  if (
    !isInclude(
      configs.map(config => config.name),
      Object.keys(params)
    )
  ) {
    matched = false;
  } else {
    configs.forEach(config => {
      const value = params[config.name as keyof typeof params];
      // 当检测项包涵正则rules
      if (config.dom.rules) {
        config.dom.rules.forEach(rule => {
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

export interface Message {
  process?: number;
  message: string;
  help?: {
    url?: string;
    description?: string;
    author?: string;
    link?: string;
  }; // 一般是发布结束的发布成功页面或者失败说明，联系作者
  type?: 'error' | 'success'; // 发布结束的状态，优先级最高
}

// 全选目标元素中内容进行更新
export const editInput = async (
  selector: string,
  content: string,
  page: any,
  callback: (e: unknown) => void
) => {
  try {
    await page.focus(selector);
    // await page.$eval(selector, () =>
    //   document.execCommand('selectall', false, undefined)
    // );
    await page.evaluate(() =>
      document.execCommand('selectall', false, undefined)
    );
    // await page.keyboard.sendCharacter('Backspace');
    await page.keyboard.sendCharacter(content);
  } catch (e) {
    callback(e);
  }
};
