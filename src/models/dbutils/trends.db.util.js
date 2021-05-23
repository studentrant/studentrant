export default class TrendDbUtils {
  constructor(trendsCollection) {
    this.TrendsCollection = trendsCollection;
  }

  async createOrUpdateTrend({ query, update, options }) {
    return this.TrendsCollection.bulkWrite([
      {
        updateMany: {
          filter: query,
          update,
          ...options,
        },
      },
    ]);
  }

  async getTotalTrendRants(query) {
    return this.TrendsCollection.findOne(query);
  }

  async getTrendsAggregation(pipeline) {
    return this.TrendsCollection.aggregate(
      [
        pipeline.matchTrendName,
        pipeline.unwindTrends,
        pipeline.removeFields,
        pipeline.skipAlreadyViewed,
        pipeline.limitTrends,
      ],
    );
  }
}
