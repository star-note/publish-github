export declare enum DomType {
    input = "INPUT",
    select = "SELECT",
    inputNumber = "INPUTNUMBER",
    textarea = "TEXTAREA",
    picker = "IMAGEPICKER",
    checkbox = "CHECKBOX"
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
export declare const checkParams: (params: Record<string, unknown>, configs: Config[]) => boolean;
export interface Message {
    process?: number;
    message: string;
    help?: {
        url?: string;
        description?: string;
        author?: string;
        link?: string;
    };
    type?: 'error' | 'success';
}
export declare const editInput: (selector: string, content: string, page: any, callback: (e: unknown) => void) => Promise<void>;
