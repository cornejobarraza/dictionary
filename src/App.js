import { useEffect, useReducer, useState, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { BeatLoader } from "react-spinners";

import { INITIAL_STATE, ACTION_TYPES, reducer } from "reducer";

// RegEx to match numbers or symbols
const numbersRegEx = /[^A-z\s]+/;
// RegEx to match spaces
const spacesRegEx = /[\s]+/;

function App() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [query, setQuery] = useState("");
  const searchInput = useRef(null);

  useEffect(() => {
    const fetchWord = async () => {
      try {
        dispatch({ type: ACTION_TYPES.FETCH_START });

        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${query}`);

        if (res.status === 200) {
          const data = await res.json();

          dispatch({ type: ACTION_TYPES.FETCH_SUCCESS, payload: data });

          const findPhonetic = data[0]?.phonetics.find((element) => element.text);

          if (findPhonetic) {
            const text = findPhonetic.text;
            dispatch({ type: ACTION_TYPES.ADD_PHONETIC, payload: text });
          } else {
            dispatch({ type: ACTION_TYPES.ADD_PHONETIC, payload: "" });
          }

          const findAudio = data[0]?.phonetics.find((element) => element.audio.length > 0);

          if (findAudio) {
            const audio = new Audio(findAudio.audio);
            dispatch({ type: ACTION_TYPES.ADD_AUDIO, payload: audio });
          } else {
            dispatch({ type: ACTION_TYPES.ADD_AUDIO, payload: null });
          }

          window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        }

        if (res.status === 404) {
          dispatch({ type: ACTION_TYPES.FETCH_ERROR, payload: "Sorry, we couldn't find that word :(" });
        }
      } catch (err) {
        dispatch({ type: ACTION_TYPES.FETCH_ERROR, payload: "API might be down, please try again" });
      }
    };

    if (query.length > 0) {
      fetchWord();
    } else {
      dispatch({ type: ACTION_TYPES.EMPTY_QUERY });
    }
  }, [query]);

  const handleInput = (e) => {
    dispatch({ type: ACTION_TYPES.CLEAR_STATUS });

    // Remove whitespaces from start and end
    const text = e.target.value.toLowerCase().trim();

    if (!numbersRegEx.test(text) && !spacesRegEx.test(text)) {
      setQuery(text);
    }

    if (!numbersRegEx.test(text) && spacesRegEx.test(text)) {
      dispatch({ type: ACTION_TYPES.INVALID_QUERY, payload: "Please do one word per search" });
    }

    if (numbersRegEx.test(text)) {
      dispatch({ type: ACTION_TYPES.INVALID_QUERY, payload: "No numbers or symbols, please try again" });
    }
  };

  const handleClick = (synonym) => {
    const text = synonym.toLowerCase().trim();

    if (!numbersRegEx.test(text) && !spacesRegEx.test(text)) {
      searchInput.current.value = synonym;
      setQuery(text);
    }
  };

  const debounce = (handler) => {
    let timeout;

    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        handler(...args);
      }, 1000);
    };
  };

  return (
    <div className="Dictionary">
      <LayoutGroup>
        <motion.div className="main">
          <motion.div className="search" layout="position">
            <div className="form">
              <small>
                Made with{" "}
                <a
                  href="https://dictionaryapi.dev/"
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "none", color: "black", fontWeight: "bold" }}
                >
                  Free Dictionary API
                </a>
              </small>
              <h2 style={{ margin: "0" }}>English dictionary</h2>
              <div className="input">
                <input
                  placeholder="Search here"
                  onChange={debounce(handleInput)}
                  disabled={state.status.loading}
                  ref={searchInput}
                />
                {((query.length > 0 && !state.status.loading) || state.status.error) && (
                  <span
                    className="clear"
                    onClick={() => {
                      searchInput.current.value = "";
                      setQuery("");
                      dispatch({ type: ACTION_TYPES.CLEAR_STATUS });
                    }}
                  ></span>
                )}
                <BeatLoader
                  size={5}
                  loading={state.status.loading}
                  speedMultiplier={0.5}
                  cssOverride={{
                    opacity: "0.5",
                    position: "absolute",
                    top: "1px",
                    right: "0",
                    transform: "translate(-50%, 0)",
                  }}
                />
              </div>
              <AnimatePresence mode="wait">
                {state.status.error && (
                  <motion.div
                    key="error"
                    className="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p style={{ margin: "0", fontSize: "0.9em" }}>{state.status.message}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence mode="wait">
                {state.response.data.length < 1 && !state.status.loading && !state.status.error && (
                  <motion.div
                    key="hint"
                    className="hint"
                    style={{ cursor: "default", marginTop: "1.5rem" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div style={{ display: "flex", justifyContent: "center", fontSize: "0.9em" }}>
                      Click on <span className="sound material-symbols-rounded"></span> to listen to pronunciation
                    </div>
                    <div style={{ marginTop: "0.75rem", fontSize: "0.9em" }}>
                      Click on{" "}
                      <span className="badge" style={{ margin: "0" }}>
                        Word
                      </span>{" "}
                      to search for a synonym
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          <AnimatePresence mode="wait">
            {state.response.data.length > 0 && !state.status.loading && (
              <motion.div
                key="result"
                className="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="header">
                  <span className="word">
                    {state.response.data[0].word.charAt(0).toUpperCase()}
                    {state.response.data[0].word.slice(1)}
                  </span>
                  <div className="pronunciation">
                    {state.response.phonetic.length > 0 && (
                      <small className="phonetic"> {state.response.phonetic} </small>
                    )}
                    {state.response.audio && (
                      <span
                        className="sound material-symbols-rounded"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          state.response.audio.play();
                        }}
                      ></span>
                    )}
                  </div>
                </div>
                {state.response.data.map((result, index) => (
                  <div key={index} className="body">
                    {result.meanings.map((meaning, index) => (
                      <div key={index} className="data">
                        <div className="type">
                          <p>
                            {meaning.partOfSpeech.charAt(0).toUpperCase()}
                            {meaning.partOfSpeech.slice(1)}
                          </p>
                        </div>
                        {meaning.synonyms.length > 0 && (
                          <div className="synonyms">
                            {meaning.synonyms.map((synonym, index) => (
                              <span
                                key={index}
                                className={
                                  numbersRegEx.test(synonym) || spacesRegEx.test(synonym) ? "badge danger" : "badge"
                                }
                                style={{ cursor: "pointer" }}
                                onClick={() => handleClick(synonym)}
                              >
                                {synonym.charAt(0).toUpperCase()}
                                {synonym.slice(1)}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="definitions">
                          {meaning.definitions.map((item, index) => (
                            <p key={index}>
                              {index + 1 + ". "}
                              {item.definition}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </div>
  );
}

export default App;
