export const SET_TEXT1 = 'SET_TEXT1';
export const SET_TEXT2 = 'SET_TEXT2';

export const setText1 = (text) => ({
    type: SET_TEXT1,
    payload: text
});

export const setText2 = (text) => ({
    type: SET_TEXT2,
    payload: text
});
