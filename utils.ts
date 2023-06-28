export enum DomType {
  input = 'INPUT',
  select = 'SELECT',
  inputNumber = 'INPUTNUMBER',
  textarea = 'TEXTAREA',
  picker = 'IMAGEPICKER',
  checkbox = 'CHECKBOX',
  date = 'DATEPICKER',
}
export interface Config {
  dom: {
    type: DomType;
    defaultValue?: string | boolean | number | null; // 如是DATEPICKER类型，应是'YYYY-MM-DD'格式
    rule?: {
      pattern?: RegExp; // input的校验正则规则
      message?: string; // 错误显示信息
      size?: {
        height: CSSStyleDeclaration['height'];
        width: CSSStyleDeclaration['width'];
        maxBit?: number;
      }; // 给图片上传使用，限制长宽比和最大体积限制，maxBit单位MB（默认1M: 1）
    };
    placeholder?: string; // input的placeholder，checkbox的框后文案（默认为label），图片上传的框内文案（默认为上传图片）
    required?: boolean;
    options?: string[]; // Select下拉框选项，如没有，则用户自定义添加
  };
  name: string; // 每一个form.item的name，需要唯一
  label?: string; // 每一个form.item的label
  help?: {
    description: string;
    url?: string;
  }; // 填写的帮助说明或文档
}

export interface Message {
  time: number; // 时间戳
  process?: number;
  content: string;
  link?: string; // 文字、图片、卡片超链接
  type?: 'text' | 'url' | 'image' | 'card'; // message支持的类型，默认text
  status?:
    | 'init'
    | 'pending'
    | 'fail'
    | 'publishing'
    | 'unsupported'
    | 'success'; // 默认为publishing
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
      if (config.dom.required && !value) {
        matched = false;
      }
      // 当检测项包涵正则rules
      if (config.dom.rule) {
        if (
          !config.dom.rule.pattern?.test(String(value)) ||
          value === undefined ||
          value === null
        ) {
          matched = false;
        }
      }
    });
  }

  return matched;
};

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

// 生成当前时间字符串
export const getTimeStr = () => {
  const time = new Date();
  return `${time.getFullYear()}-${time.getMonth()}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
}
