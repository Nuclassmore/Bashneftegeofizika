using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc.Controllers;
using System.Linq;
using System.Threading.Tasks;
using FeatureForArcGis.Models;
using FeatureForArcGis.Services;
using Microsoft.AspNetCore.Mvc;

namespace FeatureForArcGis.Controllers
{
    [Route("api/[controller]")]
    public class FeatureController: ControllerBase
    {        
            private readonly FeatureService _featureService;

            public FeatureController(FeatureService featureService)
            {
            _featureService = featureService;
            }

            [HttpGet("GetAllFeatures")]
            public ActionResult<List<Feature>> Get()
            {
            List<Feature> result = _featureService.Get();
            return result;
            }

            [HttpGet("{id:length(24)}", Name = "GetFeature")]
            public ActionResult<Feature> Get(string id)
            {
                var feature = _featureService.Get(id);

                if (feature == null)
                {
                    return NotFound();
                }

                return feature;
            }

            [HttpPost]
            public ActionResult<Feature> Create(Feature feature)
            {
            _featureService.Create(feature);

                return CreatedAtRoute("GetFeature", new { id = feature.Id.ToString() }, feature);
            }

            [HttpPut("{id:length(24)}")]
            public IActionResult Update(string id, Feature featureIn)
            {
                var feature = _featureService.Get(id);

                if (feature == null)
                {
                    return NotFound();
                }

            _featureService.Update(id, featureIn);

                return NoContent();
            }

            [HttpDelete("{id:length(24)}")]
            public IActionResult Delete(string id)
            {
                var feature = _featureService.Get(id);

                if (feature == null)
                {
                    return NotFound();
                }

            _featureService.Remove(feature.Id);

                return NoContent();
            }
    }
}
