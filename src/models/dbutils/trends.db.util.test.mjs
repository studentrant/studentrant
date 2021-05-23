import mongoose from "mongoose";
import { v4 as uuid } from "uuid";
import TrendsDbUtils from  "./trends.db.util.js";
import { Collection } from '../../../__test__/fakes/db.fakes.js';

describe("TrendDbUtils [Unit]", () => {
  
  const trendDbUtils = new TrendsDbUtils(Collection);

  describe("::createOrUpdateTrend", () => {

    let collectionBulkWriteSpy;

    beforeEach(() => {
      collectionBulkWriteSpy = spyOn(trendDbUtils.TrendsCollection, 'bulkWrite').and.callThrough();
    });

    afterEach(() => {
      collectionBulkWriteSpy.calls.reset();
    });

    it('should call bulkwrite', async () => {
      await trendDbUtils.createOrUpdateTrend(
        {
          query: { foo: 'bar' },
          update: { $set: { foo: 'baz' } },
          options: { upsert: true }
        }
      )
      expect(Collection.bulkWrite).toHaveBeenCalled();
      expect(Collection.bulkWrite).toHaveBeenCalledWith(
        [
          {
            updateMany: {
              filter: { foo: 'bar' },
              update: { $set: { foo: 'baz' } },
              upsert: true
            }
          }
        ]
      )
    })
  });

  describe("::getTotalRantsTrend", () => {
    let collectionFindOneSpy;
    beforeEach(() => {
      collectionFindOneSpy = spyOn(trendDbUtils.TrendsCollection, "findOne").and.callThrough();
    });

    afterEach(() => {
      collectionFindOneSpy.calls.reset();
    });

    it('should call findone', async () => {
      await trendDbUtils.getTotalTrendRants({ foo: 'bar' });
      expect(Collection.findOne).toHaveBeenCalled();
      expect(Collection.findOne).toHaveBeenCalledWith(
        {
          foo: 'bar'
        }
      )
    });
  });

  describe("::getTrendsFromAggregation", () => {
    let collectionAggregateSpy;

    beforeEach(() => {
      collectionAggregateSpy = spyOn(trendDbUtils.TrendsCollection, "aggregate");
    });

    afterEach(() => {
      collectionAggregateSpy.calls.reset();
    });
    
    it('should call aggregate', async () => {
      await trendDbUtils.getTrendsAggregation(
        {
          matchTrendName: { $match : { trendName: '#bar' } },
          unwindTrends: { $unwind: "$test" },
          removeFields: {
            $redact: {
              test: "test"
            }
          },
          skipAlreadyViewed: { $skip: 10 },
          limitTrends: { $limit: 2 }
        }
      );

      expect(Collection.aggregate).toHaveBeenCalled();
      expect(Collection.aggregate).toHaveBeenCalledWith(
        [
          { $match: {trendName: '#bar' } },
          { $unwind: "$test" },
          {
            $redact: {
              test: "test"
            }
          },
          { $skip: 10 },
          { $limit: 2 }
        ]
      );
      
    });
  });
});
