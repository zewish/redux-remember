import {
    SET_TEXT1,
    SET_TEXT2,
} from './actions';

const textToBePersisted = (state = '', { type, payload }) => {
    switch (type) {
        case SET_TEXT1:
            return payload;

        default:
            return state;
    }
};

const textToBeForgotten = (state = '', { type, payload }) => {
    switch (type) {
        case SET_TEXT2:
            return payload;

        default:
            return state;
    }
};

export default {
    textToBePersisted,
    textToBeForgotten,
    someData: (state = 'bla') => state
};
