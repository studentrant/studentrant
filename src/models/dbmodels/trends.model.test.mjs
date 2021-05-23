import TrendsCollection from "./trends.model.js";

import mongoose from 'mongoose';

import { v4 as uuidv4 } from 'uuid';

describe("Trend [Model]", () => {
  const trends = new TrendsCollection(
    {
      trendId: uuidv4(),
      trendName: "#test",
      trend: [ { againstCollection: "rants" , uniqueIdentifier: uuidv4() } ]
    }
  );
  it('should be defined', () => {
    expect(trends).toBeDefined();
  });
  it('should have all fields', () => {
    expect(trends.trendId).toBeDefined();
    expect(trends.trendName).toBeDefined();
    expect(trends.trend).toBeDefined();
    expect(trends.trend.length).toBeGreaterThan(0);
    expect(trends.trend[0].againstCollection).toEqual('rants');
    expect(trends.trend[0].uniqueIdentifier).toBeDefined();
  });
});
