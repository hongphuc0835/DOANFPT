using Microsoft.AspNetCore.Mvc;
using productservices.DTO;
using productservices.Implement;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace productservices.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RestaurantController : ControllerBase
    {
        private readonly IRestaurantService _restaurantService;

        public RestaurantController(IRestaurantService restaurantService)
        {
            _restaurantService = restaurantService;
        }

        [HttpGet("GetAllRestaurant")]
       public IActionResult GetAllRestaurants()
        {
            var restaurants = _restaurantService.GetAllRestaurants();
            return Ok(restaurants);
        }

        [HttpGet("{id}")]
       public IActionResult GetRestaurantById(int id)
        {
            var restaurant = _restaurantService.GetRestaurantById(id);
            if (restaurant == null) return NotFound();
            return Ok(restaurant);
        }

        [HttpPost("create")]
        public IActionResult CreateRestaurant(RestaurantDTO restaurantDTO)
        {
            var restaurant = _restaurantService.CreateRestaurant(restaurantDTO);
            return CreatedAtAction(nameof(GetRestaurantById), new { id = restaurant.RestaurantId }, restaurant);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateRestaurant(int id, UpdateRestaurantDTO updateRestaurantDTO)
        {
            var restaurant = _restaurantService.UpdateRestaurant(id, updateRestaurantDTO);
            if (restaurant == null) return NotFound();
            return Ok(restaurant);
        }

        [HttpDelete("{id}")]
       public IActionResult DeleteRestaurant(int id)
        {
            var success = _restaurantService.DeleteRestaurant(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
