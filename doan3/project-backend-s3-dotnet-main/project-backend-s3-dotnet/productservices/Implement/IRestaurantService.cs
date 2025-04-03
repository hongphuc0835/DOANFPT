using productservices.DTO;
using productservices.Models;


namespace productservices.Implement
{
    public interface IRestaurantService
    {
        IEnumerable<Restaurant> GetAllRestaurants();
        Restaurant GetRestaurantById(int id);
        RestaurantDTO CreateRestaurant(RestaurantDTO restaurantDTO);
        Restaurant UpdateRestaurant(int id, UpdateRestaurantDTO updateRestaurantDTO);
        bool DeleteRestaurant(int id);

    }
}