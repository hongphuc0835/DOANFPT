using Microsoft.AspNetCore.Mvc;
using productservices.DTO;
using productservices.Models;
using productservices.Implement;


namespace productservices.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class TourController : ControllerBase
    {
        private readonly ITourService _tourservice;

        public TourController(ITourService tourservice)
        {
            _tourservice = tourservice;
        }

        // Create a new Tour
        [HttpPost("createTour")]
        public async Task<IActionResult> CreateTour([FromBody] TourDTO tourDTO)
        {
            if (tourDTO == null)
                return BadRequest("Tour data is null");

            var createdTour = await _tourservice.CreateTourAsync(tourDTO);
            return CreatedAtAction(nameof(GetTourWithRelatedData), new { id = createdTour.TourId }, createdTour);
        }

        // Get all Tours
        [HttpGet("GetAllWithTours")]
        public async Task<IActionResult> GetAllToursWithRelatedData()
        {
            var result = await _tourservice.GetAllToursWithRelatedDataAsync();

            return Ok(result);
        }

        // Update a Tour by Id
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTour(int id, [FromBody] TourDTO tourDTO)
        {
            if (tourDTO == null)
                return BadRequest("Tour data is null");

            var updatedTour = await _tourservice.UpdateTourAsync(id, tourDTO);
            if (updatedTour == null)
                return NotFound();

            return Ok(updatedTour);
        }

        // Delete a Tour by Id
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTour(int id)
        {
            var result = await _tourservice.DeleteTourAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }


        // api trả về nhà hàng khách sạn có liên quan đến địa điểm tour
        [HttpGet("{id}/related-data")]
        public async Task<IActionResult> GetTourWithRelatedData(int id)
        {
            var result = await _tourservice.GetTourWithRelatedDataAsync(id);

            if (result == null)
            {
                return NotFound(new { Message = "Tour not found." });
            }

            return Ok(result);
        }


        // [HttpGet("search")]
        // public async Task<IActionResult> SearchTours(string? nameKeyword, decimal? targetPrice)
        // {
        //     IEnumerable<object> result;

        //     // Tìm kiếm theo tên và giá nếu có
        //     if (nameKeyword != null && targetPrice.HasValue)
        //     {
        //         result = await _tourservice.SearchToursAsync(nameKeyword, targetPrice);
        //     }
        //     // Tìm kiếm chỉ theo tên nếu không có giá
        //     else if (nameKeyword != null)
        //     {
        //         result = await _tourservice.SearchToursAsync(nameKeyword, null);
        //     }
        //     // Tìm kiếm chỉ theo giá nếu không có tên
        //     else if (targetPrice.HasValue)
        //     {
        //         result = await _tourservice.SearchToursAsync(null, targetPrice);
        //     }
        //     else
        //     {
        //         return BadRequest(new { message = "No search criteria provided." });
        //     }

        //     if (!result.Any())
        //     {
        //         return NotFound(new { message = "No tours found matching the criteria." });
        //     }

        //     return Ok(result);
        // }

    }

}