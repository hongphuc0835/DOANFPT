using Microsoft.AspNetCore.Mvc;
using productservices.DTO;
using productservices.Models;
using productservices.Implement;

namespace productservices.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HotelController : ControllerBase
    {
        private readonly IHotelService _hotelService;

        public HotelController(IHotelService hotelService)
        {
            _hotelService = hotelService;
        }

        // Create a new hotel
        [HttpPost("create")]
        public async Task<IActionResult> CreateHotel([FromBody] HotelDTO hotelDto)
        {
            if (hotelDto == null)
            {
                return BadRequest("Hotel data is null.");
            }

            var result = await _hotelService.CreateHotel(hotelDto);
            return CreatedAtAction(nameof(GetHotelById), new { id = result.HotelId }, result);
        }

        // Get all hotels
        [HttpGet("GetAllHotels")]
        public async Task<IActionResult> GetHotels()
        {
            var hotels = await _hotelService.GetHotels();
            return Ok(hotels);
        }

        // Get hotel by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetHotelById(int id)
        {
            try
            {
                var hotel = await _hotelService.GetHotelById(id);
                return Ok(hotel);
            }
            catch (KeyNotFoundException)
            {
                return NotFound("Hotel not found.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateHotel(int id, [FromBody] HotelUpdateDTO hotelUpdateDTO)
        {
            if (id != hotelUpdateDTO.HotelId)
            {
                return BadRequest("Hotel ID mismatch");
            }

            var existingHotel = await _hotelService.GetHotelById(id);
            if (existingHotel == null)
            {
                return NotFound(new { message = "Hotel not found." });
            }

            var updatedHotel = await _hotelService.UpdateHotel(id, hotelUpdateDTO);
            return Ok(updatedHotel); // Trả về đối tượng khách sạn đã được cập nhật
        }


        // Delete hotel
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHotel(int id)
        {
            try
            {
                await _hotelService.DeleteHotel(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound("Hotel not found.");
            }
        }
    }
}
