import { Callbacks, Language, Options, Templates, ZuckObject } from './types';
export declare const optionsDefault: (option?: ZuckObject['option']) => Options;
export declare const option: <T extends keyof Options>(options?: Options, _name?: T) => Options[T];
export declare const loadOptions: (options?: Options) => {
    option: <T extends keyof Options>(name: T) => Options[T];
    callback: <C extends keyof Callbacks>(name: C) => Callbacks[C];
    template: <T_1 extends keyof Templates>(name: T_1) => Templates[T_1];
    language: <L extends keyof Language>(name: L) => Language[L];
};
