using productservices.Models;

namespace productservices.DTO
{
    public class DestinationWithToursDTO
    {
        public Destination Destination { get; set; }
        public List<Tour> Tours { get; set; }
        // public List<Hotel> Hotels { get; set; }
        // public List<Restaurant> Restaurants { get; set; }
    }
}