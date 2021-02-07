import { Store } from 'redux';
import { ExtendedOptions } from './types';
declare const init: (store: Store<any, any>, rememberedKeys: string[], { prefix, driver, serialize, unserialize, persistThrottle, persistWholeStore }: ExtendedOptions) => Promise<void>;
export default init;
