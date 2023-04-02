export const INITIAL_STATE = {
  response: { data: [], phonetic: "", audio: undefined },
  status: { loading: false, error: false, message: "" },
};

export const ACTION_TYPES = {
  CLEAR_STATUS: "CLEAR_STATUS",
  EMPTY_QUERY: "EMPTY_QUERY",
  INVALID_QUERY: "INVALID_QUERY",
  FETCH_START: "FETCH_START",
  FETCH_SUCCESS: "FETCH_SUCCESS",
  FETCH_ERROR: "FETCH_ERROR",
  ADD_PHONETIC: "ADD_PHONETIC",
  ADD_AUDIO: "ADD_AUDIO",
};

export const reducer = (state, action) => {
  switch (action.type) {
    case "CLEAR_STATUS":
      return {
        ...state,
        status: { loading: false, error: false, message: "" },
      };
    case "EMPTY_QUERY":
      return {
        response: { data: [], phonetic: "", audio: undefined },
        status: { loading: false, error: false, message: "" },
      };
    case "INVALID_QUERY":
      return {
        ...state,
        status: { loading: false, error: true, message: action.payload },
      };
    case "FETCH_START":
      return {
        ...state,
        status: { loading: true, error: false, message: "" },
      };
    case "FETCH_SUCCESS":
      return {
        response: { ...state.response, data: action.payload },
        status: { ...state.status, loading: false },
      };
    case "FETCH_ERROR":
      return {
        ...state,
        status: { loading: false, error: true, message: action.payload },
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
