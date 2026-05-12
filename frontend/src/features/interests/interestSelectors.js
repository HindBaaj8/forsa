export const selectInterestsByRequest = (state, requestId) => 
  state.interests.items[requestId] || [];
export const selectInterestsLoading = (state) => state.interests.isLoading;