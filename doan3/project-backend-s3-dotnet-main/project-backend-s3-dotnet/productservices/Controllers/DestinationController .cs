using Microsoft.AspNetCore.Mvc;
using productservices.DTO;
using productservices.Models;
using productservices.Implement;


namespace productservices.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class DestinationController : ControllerBase
    {
        private readonly IDestinationService _destinationservice;

        public DestinationController(IDestinationService destinationservice)
        {
            _destinationservice = destinationservice;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateDestination([FromBody] DestinationDTO destinationDto)
        {
            var destination = await _destinationservice.CreateDestinationAsync(destinationDto);
            return CreatedAtAction(nameof(GetDestinationWithTours), new { id = destination.DestinationId }, destination);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DestinationWithToursDTO>> GetDestinationWithTours(int id)
        {
            var result = await _destinationservice.GetDestinationByIdWithToursAsync(id);

            if (result == null)
            {
                return NotFound(); // Trả về lỗi 404 nếu không tìm thấy
            }

            return Ok(result); // Trả về dữ liệu nếu tìm thấy
        }

        [HttpGet("getAllDestinationsWithTours")]
        public async Task<ActionResult<List<DestinationWithToursDTO>>> GetAllDestinationsWithTours()
        {
            var result = await _destinationservice.GetAllDestinationsWithToursAsync();

            if (result == null || result.Count == 0)
            {
                return NotFound(); // Trả về lỗi 404 nếu không tìm thấy
            }

            return Ok(result); // Trả về dữ liệu nếu tìm thấy
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDestination(int id, [FromBody] DestinationDTO destinationDto)
        {
            var destination = await _destinationservice.UpdateDestinationAsync(id, destinationDto);

            if (destination == null) return NotFound();

            return Ok(destination);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDestination(int id)
        {
            var success = await _destinationservice.DeleteDestinationAsync(id);

            if (!success) return NotFound();

            return NoContent();
        }



        // Phương thức GET để lấy Destination và các Tour liên quan theo tên gần đúng
        [HttpGet("DestinationName/{name}")]
        public async Task<ActionResult<List<DestinationWithToursDTO>>> GetDestinationsByNameWithTours(string name)
        {
            var result = await _destinationservice.GetDestinationsByNameWithToursAsync(name);

            if (result == null || result.Count == 0)
            {
                return NotFound(); // Trả về lỗi 404 nếu không tìm thấy
            }

            return Ok(result); // Trả về dữ liệu nếu tìm thấy
        }

    }

}