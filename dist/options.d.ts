import { Options, ZuckObject } from './types';
export declare const optionsDefault: (option?: ZuckObject['option']) => Options;
export declare const option: (options?: Options, _name?: string, _prop?: string) => any;
export declare const loadOptions: (opts?: Options) => {
    option: (name: string, prop?: string) => any;
};
