const INITIAL_STATE = {
  competitions: [],
  leaderboards: {},
};
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'LOAD_SOMETHING': {
      return {
        ...state,
      };
    }
    default:
      return state;
  }
};
