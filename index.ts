import { formConfigs, publish } from './web';
import {
  formConfigs as electronForm,
  publish as electronPublish,
} from './electron';

// 各端所需的配置信息及发布方法
// 名字必须$publish_开头，后面必须与配置的key相同
// eslint-disable-next-line @typescript-eslint/naming-convention
export const $publish_github = {
  key: 'github',
  label: 'Github',
  logo: './icons/icon_128.png',
  web: {
    form: formConfigs,
    publish,
  }, // web端发布的配置及方法
  electron: {
    form: electronForm,
    publish: electronPublish,
  }, // 桌面端发布的配置及方法
  server: {}, // 服务器端发布的配置及方法
  author: {
    name: 'ludejun',
    email: 'ludejun@live.cn',
    blog: '',
    userId: '0',
    avator: '',
  }, // 作者信息
};
