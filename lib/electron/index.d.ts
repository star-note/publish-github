import { Config, Message } from '../utils';
export declare const startUrl = "https://www.github.com/login";
export declare const formConfigs: Config[];
export declare const publish: (payload: Record<string, any>, postProcess: (target: string, msg: Message) => void, page: any) => Promise<void>;
