namespace productservices.DTO
{
    public class HotelUpdateDTO
    {
        public int HotelId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public string Address { get; set; }
        public decimal Price { get; set; }
        public double Rating { get; set; }
        public int DestinationId { get; set; }
    }
}
