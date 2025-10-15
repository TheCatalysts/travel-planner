export const RANK_ACTIVITIES_QUERY = `
  query RankActivities($stationId: String!) {
    rankActivities(stationId: $stationId) {
      activity
      score
      message
    }
  }
`;