using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using productservices.Data;
using productservices.DTO;
using productservices.Implement;
using productservices.Models;

namespace productservices.Services
{
    public class RestaurantService : IRestaurantService
    {
        private readonly APIContext _context;

        public RestaurantService(APIContext context)
        {
            _context = context;
        }

        public IEnumerable<Restaurant> GetAllRestaurants()
        {
            return _context.Restaurants.Include(r => r.Destinations).ToList();
        }


        public Restaurant GetRestaurantById(int id)
        {
            var restaurant = _context.Restaurants
                                     .Include(r => r.Destinations) // Bao gồm thông tin liên quan đến Destination
                                     .FirstOrDefault(r => r.RestaurantId == id);

            if (restaurant == null) return null;

            return restaurant; // Trả về trực tiếp đối tượng Restaurant
        }


        public RestaurantDTO CreateRestaurant(RestaurantDTO restaurantDTO)
        {
            var restaurant = new Restaurant
            {
                Name = restaurantDTO.Name,
                Description = restaurantDTO.Description,
                ImageUrl = restaurantDTO.ImageUrl,
                Address = restaurantDTO.Address,
                Price = restaurantDTO.Price,
                Rating = restaurantDTO.Rating,
                DestinationId = restaurantDTO.DestinationId
            };

            _context.Restaurants.Add(restaurant);
            _context.SaveChanges();

            restaurantDTO.RestaurantId = restaurant.RestaurantId;
            return restaurantDTO;
        }

        public Restaurant UpdateRestaurant(int id, UpdateRestaurantDTO updateRestaurantDTO)
        {
            // Tìm kiếm nhà hàng theo id
            var restaurant = _context.Restaurants
                                      .Include(r => r.Destinations) // Bao gồm thông tin Destination
                                      .FirstOrDefault(r => r.RestaurantId == id);
            if (restaurant == null) return null; // Nếu không tìm thấy nhà hàng thì trả về null

            // Cập nhật các trường của nhà hàng
            restaurant.Name = updateRestaurantDTO.Name;
            restaurant.Description = updateRestaurantDTO.Description;
            restaurant.ImageUrl = updateRestaurantDTO.ImageUrl;
            restaurant.Address = updateRestaurantDTO.Address;
            restaurant.Price = updateRestaurantDTO.Price;
            restaurant.Rating = updateRestaurantDTO.Rating;
            restaurant.DestinationId = updateRestaurantDTO.DestinationId;

            // Cập nhật thời gian sửa đổi
            restaurant.UpdatedAt = DateTime.UtcNow;

            // Lưu các thay đổi vào cơ sở dữ liệu
            _context.SaveChanges();

            // Trả về đối tượng Restaurant đầy đủ (bao gồm Destination)
            return restaurant;
        }


        public bool DeleteRestaurant(int id)
        {
            var restaurant = _context.Restaurants.Find(id);
            if (restaurant == null) return false;

            _context.Restaurants.Remove(restaurant);
            _context.SaveChanges();
            return true;
        }
    }
}
