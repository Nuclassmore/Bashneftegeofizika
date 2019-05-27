using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FeatureForArcGis.Models;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

namespace FeatureForArcGis.Services
{
    public class FeatureService
    {
        private readonly IMongoCollection<Feature> _features;

        public FeatureService(IConfiguration config)
        {
            var client = new MongoClient(config.GetConnectionString("FeaturesDataDB"));
            var database = client.GetDatabase("FeaturesDataDB");
            _features = database.GetCollection<Feature>("Features");
        }

        public List<Feature> Get()
        {
            return _features.Find(feature => true).ToList();
        }

        public Feature Get(string id)
        {
            return _features.Find<Feature>(feature => feature.Id == id).FirstOrDefault();
        }

        public Feature Create(Feature feature)
        {
            _features.InsertOne(feature);
            return feature;
        }

        public void Update(string id, Feature featureIn)
        {
            _features.ReplaceOne(feature => feature.Id == id, featureIn);
        }

        public void Remove(Feature featureIn)
        {
            _features.DeleteOne(feature => feature.Id == featureIn.Id);
        }

        public void Remove(string id)
        {
            _features.DeleteOne(feature => feature.Id == id);
        }
    }
}
