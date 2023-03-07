export const INITIAL_STATE = {
  response: { data: [], phonetic: "", audio: null },
  status: { loading: false, error: false, errorMsg: null },
};

export const reducer = (state, action) => {
  switch (action.type) {
    case "CLEAR_STATUS":
      return {
        ...state,
        status: { loading: false, error: false, errorMsg: null },
      };
    case "EMPTY_QUERY":
      return {
        response: { data: [], phonetic: "", audio: null },
        status: { loading: false, error: false, errorMsg: null },
      };
    case "INVALID_QUERY":
      return {
        ...state,
        status: { loading: false, error: true, errorMsg: action.payload },
      };
    case "FETCH_START":
      return {
        ...state,
        status: { loading: true, error: false, errorMsg: null },
      };
    case "FETCH_SUCCESS":
      return {
        response: { ...state.response, data: action.payload },
        status: { ...state.status, loading: false },
      };
    case "FETCH_ERROR":
      return {
        ...state,
        status: { loading: false, error: true, errorMsg: action.payload },
      };
    case "ADD_PHONETIC":
      return {
        ...state,
        response: { ...state.response, phonetic: action.payload },
      };
    case "ADD_AUDIO":
      return {
        ...state,
        response: { ...state.response, audio: action.payload },
      };
    default:
      return state;
  }
};
