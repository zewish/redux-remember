import {
    SET_TEXT1,
    SET_TEXT2,
} from './actions';

const text = (state = '', { type, payload }) => {
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
    persistable: {
        text
    },
    forgettable: {
        textToBeForgotten
    }
};
