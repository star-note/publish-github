import { Config, Message } from '../utils';
export declare const formConfigs: Config[];
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
export declare const publish: (options: Options, postProcess: (msg: Message) => void) => Promise<void>;
